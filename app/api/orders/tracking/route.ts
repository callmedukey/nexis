import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateTrackingSchema = z.object({
  orderId: z.string(),
  trackingCompany: z.string().optional(),
  trackingNumber: z.string().optional(),
});

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const result = await updateTrackingSchema.safeParseAsync(body);

    if (!result.success) {
      return new NextResponse("Invalid input", { status: 400 });
    }

    const { orderId, trackingCompany, trackingNumber } = result.data;

    const updateData: any = {};
    if (trackingCompany !== undefined) updateData.trackingCompany = trackingCompany;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_TRACKING_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 