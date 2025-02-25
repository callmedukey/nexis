import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
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
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/account/payment/fail?orderId=${orderId}`
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
