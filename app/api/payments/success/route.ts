import { PurchaseStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const paymentKey = url.searchParams.get("paymentKey");
    const orderId = url.searchParams.get("orderId");
    const amount = url.searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get temporary order data
    const tempOrder = await prisma.temporaryOrder.findUnique({
      where: { id: orderId },
    });

    if (!tempOrder) {
      return NextResponse.json(
        {
          error: "Order not found",
          details: `Could not find order with ID: ${orderId}`,
        },
        { status: 404 }
      );
    }

    const orderData = tempOrder.orderData as any;

    if (orderData.price !== parseInt(amount)) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // Confirm payment with Toss Payments API
    const response = await fetch(
      `https://api.tosspayments.com/v1/payments/${paymentKey}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.TOSS_CLIENT_SECRET + ":"
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          amount,
        }),
      }
    );

    const paymentData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to confirm payment" },
        { status: response.status }
      );
    }

    // Create the actual order and update stock in a transaction
    await prisma.$transaction(async (tx) => {
      // Create the order
      await tx.order.create({
        data: {
          id: orderId,
          user: {
            connect: {
              providerId: orderData.userId,
            },
          },
          status: PurchaseStatus.PENDING_DELIVERY,
          paymentStatus: "PAID",
          paymentMethod: paymentData.method,
          deliveryAddress: {
            create: {
              name: orderData.deliveryInfo.name,
              phone: orderData.deliveryInfo.phone,
              address: orderData.deliveryInfo.address,
              detailedAddress: orderData.deliveryInfo.detailedAddress,
              zipcode: orderData.deliveryInfo.zipcode,
            },
          },
          price: orderData.price,
          discount: orderData.discount,
          products: {
            connect: orderData.cartItems.map((item: any) => ({
              id: item.productId,
            })),
          },
          orderContent: {
            products: orderData.cartItems,
            totalAmount: orderData.price,
            originalAmount: orderData.originalTotal,
            couponDiscount: orderData.discount,
          },
        },
      });

      // Update product stock
      for (const item of orderData.cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Update user's default address if requested
      if (orderData.deliveryInfo.setAsDefault) {
        await tx.user.update({
          where: { providerId: orderData.userId },
          data: {
            name: orderData.deliveryInfo.name,
            phone: orderData.deliveryInfo.phone,
            address: orderData.deliveryInfo.address,
            detailedAddress: orderData.deliveryInfo.detailedAddress,
            zipcode: orderData.deliveryInfo.zipcode,
          },
        });
      }

      // Clear the cart
      await tx.cart.update({
        where: { providerId: orderData.userId },
        data: {
          items: {
            deleteMany: {},
          },
        },
      });

      // Delete temporary order
      await tx.temporaryOrder.delete({
        where: { id: orderId },
      });
    });

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/account/payment/success?orderId=${orderId}`
    );
  } catch (error) {
    console.error("[PAYMENT_SUCCESS]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
