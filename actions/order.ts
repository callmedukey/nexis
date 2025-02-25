"use server";

import { PurchaseStatus } from "@prisma/client";
import { format } from "date-fns";
import { cookies } from "next/headers";
import { z } from "zod";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const submitOrderSchema = z.object({
  couponDiscount: z.number().min(0),
  deliveryInfo: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
    detailedAddress: z.string(),
    zipcode: z.string(),
    setAsDefault: z.boolean(),
  }),
});

export async function submitOrder(data: z.infer<typeof submitOrderSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const result = await submitOrderSchema.safeParseAsync(data);
    if (!result.success) {
      return { error: "Invalid data" };
    }

    const { couponDiscount } = result.data;

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { providerId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || !cart.items.length) {
      return { error: "Cart is empty" };
    }

    // Check stock availability for all items
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return {
          error: `${item.product.name}의 재고가 부족합니다. 현재 재고: ${item.product.stock}개`,
        };
      }
    }

    // Generate unique order ID
    const today = format(new Date(), "yyyyMMdd");

    // Get the last sequence from both orders and temporary orders
    const [lastOrder, lastTempOrder] = await Promise.all([
      prisma.order.findFirst({
        where: {
          id: {
            startsWith: today,
          },
        },
        orderBy: {
          id: "desc",
        },
      }),
      prisma.temporaryOrder.findFirst({
        where: {
          id: {
            startsWith: today,
          },
        },
        orderBy: {
          id: "desc",
        },
      }),
    ]);

    // Get the highest sequence number from both
    let lastSequence = 0;

    if (lastOrder) {
      lastSequence = Math.max(lastSequence, parseInt(lastOrder.id.slice(-4)));
    }

    if (lastTempOrder) {
      lastSequence = Math.max(
        lastSequence,
        parseInt(lastTempOrder.id.slice(-4))
      );
    }

    // Generate next sequence number
    const sequenceNumber = String(lastSequence + 1).padStart(4, "0");
    const orderId = `${today}${sequenceNumber}`;

    // Calculate totals
    const originalTotal = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0
    );

    const discountedTotal = cart.items.reduce(
      (acc, item) =>
        acc +
        item.quantity *
          Math.round(item.product.price * (1 - item.product.discount / 100)),
      0
    );

    const finalTotal = discountedTotal - couponDiscount;

    // Store temporary order data
    const orderData = {
      orderId,
      userId: session.user.id,
      deliveryInfo: data.deliveryInfo,
      cartItems: cart.items.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: Math.round(
          item.product.price * (1 - item.product.discount / 100)
        ),
        originalPrice: item.product.price,
        selectedOption: item.selectedOption,
        subTotalPrice:
          item.quantity *
          Math.round(item.product.price * (1 - item.product.discount / 100)),
      })),
      price: finalTotal,
      discount: couponDiscount,
      originalTotal,
    };

    // Delete any existing temporary orders for this user
    await prisma.temporaryOrder.deleteMany({
      where: { userId: session.user.id },
    });

    // Create new temporary order
    await prisma.temporaryOrder.create({
      data: {
        id: orderId,
        userId: session.user.id,
        orderData: orderData as any,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // Expires in 30 minutes
      },
    });

    // Initialize payment
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const cookieHeader = (await cookies()).toString();
    const paymentResponse = await fetch(`${baseUrl}/api/payments/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        orderId: orderId,
      }),
      cache: "no-store",
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      // Clean up temporary order if payment initialization fails
      await prisma.temporaryOrder
        .delete({
          where: { id: orderId },
        })
        .catch(() => {
          // Ignore deletion errors
        });
      return { error: "결제 초기화에 실패했습니다" };
    }

    return { success: true, orderId, paymentData };
  } catch (error) {
    return { error: "Failed to submit order" };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: PurchaseStatus
) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { error: "Order not found" };
    }
    // If status is being changed to CANCELLED, restore stock
    if (status === PurchaseStatus.CANCELLED) {
      await prisma.$transaction(async (tx) => {
        // Restore stock for each product
        const products = (order.orderContent as any).products;
        for (const item of products) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }

        // Update order status
        await tx.order.update({
          where: { id: orderId },
          data: { status },
        });
      });
    } else {
      // Just update the status if not cancelling
      await prisma.order.update({
        where: { id: orderId },
        data: { status },
      });
    }

    return { success: true };
  } catch (error) {
    return { error: "Failed to update order status" };
  }
}
