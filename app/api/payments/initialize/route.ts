import { NextResponse } from "next/server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

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

    // Get the base URL from the request
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;
    
    console.log("Using base URL:", baseUrl);
    
    // Create payment data for client-side initialization
    // Only include the fields that are allowed in the TOSS payment request
    const paymentData = {
      orderId: orderData.orderId,
      orderName: `Order #${orderData.orderId}`,
      customerName: orderData.deliveryInfo.name || "Guest",
      customerEmail: "customer@example.com", // Add a default email if needed
      customerMobilePhone: orderData.deliveryInfo.phone || "01012341234", // Add phone number
      successUrl: `${baseUrl}/account/payment/success?orderId=${orderData.orderId}`,
      failUrl: `${baseUrl}/account/payment/fail?orderId=${orderData.orderId}`,
    };

    console.log("Payment initialization data:", paymentData);
    return NextResponse.json(paymentData);
  } catch (error) {
    // Safely log the error without causing additional errors
    try {
      console.error("[PAYMENT_INITIALIZE]", error);
    } catch {
      console.error("[PAYMENT_INITIALIZE] Error occurred but could not be logged");
    }
    
    // Fix the error handling to ensure proper JSON response
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
