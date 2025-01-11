"use server";

import { PurchaseStatus } from "@prisma/client";
import { format } from "date-fns";
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

    // Create order and update stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Update product stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      if (data.deliveryInfo.setAsDefault) {
        await tx.user.update({
          where: { providerId: session.user.id },
          data: {
            name: data.deliveryInfo.name,
            phone: data.deliveryInfo.phone,
            address: data.deliveryInfo.address,
            detailedAddress: data.deliveryInfo.detailedAddress,
            zipcode: data.deliveryInfo.zipcode,
          },
        });
      }

      // Create the order
      return await tx.order.create({
        data: {
          id: orderId,
          user: {
            connect: {
              providerId: session.user.id,
            },
          },
          status: PurchaseStatus.PENDING,
          deliveryAddress: {
            create: {
              name: data.deliveryInfo.name,
              phone: data.deliveryInfo.phone,
              address: data.deliveryInfo.address,
              detailedAddress: data.deliveryInfo.detailedAddress,
              zipcode: data.deliveryInfo.zipcode,
            },
          },
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
    console.error("Order status update error:", error);
    return { error: "Failed to update order status" };
  }
}
