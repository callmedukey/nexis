"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { ROUTES } from "@/constants/general";
import prisma from "@/lib/prisma";

const addToCartSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1).default(1),
  optionIndex: z.number().optional(),
});

const updateCartItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().min(1),
});

type ServerResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  redirect?: string;
};

export async function addToCart(
  data: z.infer<typeof addToCartSchema>
): Promise<ServerResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "장바구니에 담으려면 로그인이 필요합니다",
        redirect: ROUTES.LOGIN,
      };
    }

    const result = await addToCartSchema.safeParseAsync(data);
    if (!result.success) {
      return {
        success: false,
        message: "Invalid input",
        errors: result.error.flatten().fieldErrors,
      };
    }

    const { productId, quantity, optionIndex } = result.data;

    // First verify the user exists
    const user = await prisma.user.findUnique({
      where: { providerId: session.user.id },
      include: { cart: true },
    });

    if (!user) {
      return {
        success: false,
        message: "사용자를 찾을 수 없습니다",
      };
    }

    // Get the product to check options
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return {
        success: false,
        message: "상품을 찾을 수 없습니다",
      };
    }

    // Validate option index if product has options
    if (product.options.length > 0 && optionIndex === undefined) {
      return {
        success: false,
        message: "상품 옵션을 선택해주세요",
      };
    }

    if (
      optionIndex !== undefined &&
      (optionIndex < 0 || optionIndex >= product.options.length)
    ) {
      return {
        success: false,
        message: "잘못된 상품 옵션입니다",
      };
    }

    // Get or create cart
    let cart = user.cart;
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          providerId: user.providerId,
        },
      });
    }

    // Check if product with same option already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        selectedOption:
          optionIndex !== undefined ? product.options[optionIndex] : null,
      },
    });

    if (existingItem) {
      // Update existing item quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Add new item to cart
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          selectedOption:
            optionIndex !== undefined ? product.options[optionIndex] : null,
        },
      });
    }

    revalidatePath("/cart");

    return {
      success: true,
      message: "상품이 장바구니에 추가되었습니다",
    };
  } catch (error) {
    console.error("[ADD_TO_CART]", error);
    return {
      success: false,
      message: "장바구니에 상품을 추가하는 중 오류가 발생했습니다",
    };
  }
}

export async function updateCartItem(
  input: z.infer<typeof updateCartItemSchema>
): Promise<ServerResponse<{ itemId: string }>> {
  const parseResult = await updateCartItemSchema.safeParseAsync(input);

  if (!parseResult.success) {
    return {
      success: false,
      errors: {
        form: ["잘못된 입력 데이터입니다"],
      },
    };
  }

  const { itemId, quantity } = parseResult.data;
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "장바구니를 수정하려면 로그인이 필요합니다",
    };
  }

  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: +itemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.providerId !== session.user.id) {
      return {
        success: false,
        message: "장바구니 상품을 찾을 수 없습니다",
      };
    }

    await prisma.cartItem.update({
      where: { id: +itemId },
      data: { quantity },
    });

    revalidatePath("/cart");
    return {
      success: true,
      data: { itemId },
      message: "장바구니가 업데이트되었습니다",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "장바구니 수정에 실패했습니다",
      errors: {
        database: ["장바구니 업데이트 중 오류가 발생했습니다"],
      },
    };
  }
}

export async function removeCartItem(
  itemId: string
): Promise<ServerResponse<{ itemId: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "장바구니를 수정하려면 로그인이 필요합니다",
    };
  }

  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: +itemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.providerId !== session.user.id) {
      return {
        success: false,
        message: "장바구니 상품을 찾을 수 없습니다",
      };
    }

    await prisma.cartItem.delete({
      where: { id: +itemId },
    });

    revalidatePath("/cart");
    return {
      success: true,
      data: { itemId },
      message: "상품이 장바구니에서 삭제되었습니다",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "상품 삭제에 실패했습니다",
      errors: {
        database: ["장바구니 업데이트 중 오류가 발생했습니다"],
      },
    };
  }
}

export async function validateCoupon(
  code: string
): Promise<ServerResponse<{ flatDiscount?: number; discountRate?: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "로그인이 필요합니다",
      };
    }

    const coupon = await prisma.coupon.findUnique({
      where: {
        code,
        active: true,
      },
    });

    if (!coupon) {
      return {
        success: false,
        message: "유효하지 않은 쿠폰입니다",
      };
    }

    return {
      success: true,
      message: "쿠폰이 적용되었습니다",
      data: {
        flatDiscount: coupon.flatDiscount ?? undefined,
        discountRate: coupon.discountRate ?? undefined,
      },
    };
  } catch (error) {
    console.error("[VALIDATE_COUPON]", error);
    return {
      success: false,
      message: "쿠폰 확인 중 오류가 발생했습니다",
    };
  }
}

export async function getCartItems() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "로그인이 필요합니다",
      };
    }

    const cart = await prisma.cart.findUnique({
      where: { providerId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                productMainImages: true,
              },
            },
          },
        },
        user: true,
      },
    });

    return {
      success: true,
      data: cart,
    };
  } catch (error) {
    console.error("[GET_CART]", error);
    return {
      success: false,
      message: "장바구니를 불러오는데 실패했습니다",
    };
  }
}
