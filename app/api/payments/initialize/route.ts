import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();

    const tempOrder = await prisma.temporaryOrder.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
    });

    if (!tempOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = tempOrder.orderData as any;

    // Create payment data for client-side initialization
    const paymentData = {
      method: "CARD",
      amount: {
        currency: "KRW",
        value: orderData.price,
      },
      orderId: orderData.orderId,
      orderName: `Order #${orderData.orderId}`,
      customerName: orderData.deliveryInfo.name || "Guest",
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/success`,
      failUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/fail`,
    };

    console.log("Server Payment Data:", paymentData);
    return NextResponse.json(paymentData);
  } catch (error) {
    console.error("[PAYMENT_INITIALIZE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
