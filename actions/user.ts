"use server";

import { auth } from "@/auth";
import { AddressSchema, UserProfileSchema } from "@/lib/constants/zod";
import prisma from "@/lib/prisma";

type UpdateUserData = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  zipcode?: string;
};

export const updateUser = async (data: UpdateUserData) => {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, message: "인증되지 않은 사용자입니다." };
    }

    // Check if this is a profile update or address update
    if ("name" in data || "email" in data || "phone" in data) {
      const validated = await UserProfileSchema.safeParseAsync(data);
      if (!validated.success) {
        return { success: false, message: "유효하지 않은 값입니다." };
      }
    } else if ("address" in data || "zipcode" in data) {
      const validated = await AddressSchema.safeParseAsync(data);
      if (!validated.success) {
        return { success: false, message: "유효하지 않은 값입니다." };
      }
    }

    const user = await prisma.user.update({
      where: { providerId: session.user.id },
      data,
    });

    if (!user) {
      return { success: false, message: "정보 수정 실패" };
    }

    const isAddressUpdate = "address" in data || "zipcode" in data;
    return {
      success: true,
      message: isAddressUpdate
        ? "주소 정보를 성공적으로 수정했습니다."
        : "계정 정보를 성공적으로 수정했습니다.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "정보 수정 실패" };
  }
};

export const cancelOrder = async (orderId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "로그인이 필요합니다." };
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user: {
          providerId: session.user.id
        }
      }
    });

    if (!order) {
      return { success: false, message: "주문을 찾을 수 없습니다." };
    }

    if (order.status !== "PENDING_DELIVERY") {
      return { success: false, message: "배송 준비중인 주문만 취소할 수 있습니다." };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLING" }
    });

    revalidatePath("/account/history");
    return { success: true, message: "주문 취소가 요청되었습니다." };
  } catch (error) {
    console.error("[CANCEL_ORDER]", error);
    return { success: false, message: "주문 취소 요청에 실패했습니다." };
  }
};
