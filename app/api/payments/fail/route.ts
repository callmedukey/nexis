import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    // Handle duplicate orderId parameters by getting all values and using the first one
    const orderIds = url.searchParams.getAll("orderId");
    const orderId = orderIds.length > 0 ? orderIds[0] : null;

    console.log("Fail route parameters:", {
      orderIds,
      orderId,
      url: req.url
    });

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing required parameters", details: { orderId } },
        { status: 400 }
      );
    }

    // Delete the temporary order
    await prisma.temporaryOrder
      .delete({
        where: { id: orderId },
      })
      .catch(() => {
        // Ignore error if temporary order doesn't exist
      });

    // Redirect to failure page
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;
    
    return NextResponse.redirect(
      `${baseUrl}/account/payment/fail?orderId=${orderId}`
    );
  } catch (error) {
    // Safely log the error without causing additional errors
    try {
      console.error("[PAYMENT_FAIL]", error);
    } catch {
      console.error("[PAYMENT_FAIL] Error occurred but could not be logged");
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
