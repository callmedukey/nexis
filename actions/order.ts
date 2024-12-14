"use server";

import { PurchaseStatus } from "@prisma/client";
import { format } from "date-fns";
import { z } from "zod";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const submitOrderSchema = z.object({
  couponDiscount: z.number().min(0),
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

    // Generate custom order ID (YYYYMMDD + 4 digits)
    const today = format(new Date(), "yyyyMMdd");

    // Get the last order of the day to determine the sequence number
    const lastOrder = await prisma.order.findFirst({
      where: {
        id: {
          startsWith: today,
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    let sequenceNumber = "0001";
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.id.slice(-4));
      sequenceNumber = String(lastSequence + 1).padStart(4, "0");
    }

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

    // Create order
    const order = await prisma.order.create({
      data: {
        id: orderId,
        user: {
          connect: {
            providerId: session.user.id,
          },
        },
        status: PurchaseStatus.PENDING,
        price: finalTotal,
        discount: couponDiscount,
        products: {
          connect: cart.items.map((item) => ({
            id: item.productId,
          })),
        },
        orderContent: {
          products: cart.items.map((item) => ({
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
              Math.round(
                item.product.price * (1 - item.product.discount / 100)
              ),
          })),
          totalAmount: finalTotal,
          originalAmount: originalTotal,
          couponDiscount,
        },
      },
    });

    // Clear cart
    await prisma.cart.update({
      where: { providerId: session.user.id },
      data: {
        items: {
          deleteMany: {},
        },
      },
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Order submission error:", error);
    return { error: "Failed to submit order" };
  }
}
