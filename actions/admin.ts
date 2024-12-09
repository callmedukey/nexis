"use server";

import { ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { unlink } from "fs/promises";
import { join } from "path";

import { auth } from "@/auth";
import { productSchema } from "@/lib/constants/zod";
import prisma from "@/lib/prisma";
import { uploadImage } from "@/lib/utils/upload";

type ServerResponse<T = void> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};

export async function createProduct(
  data: z.infer<typeof productSchema>
): Promise<ServerResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    // Save main images
    const mainImagePromises = data.productMainImages.map((file) =>
      uploadImage(file, "products/main")
    );
    const mainImages = await Promise.all(mainImagePromises);

    // Save detail images
    const detailImagePromises = data.productImages.map((file) =>
      uploadImage(file, "products/detail")
    );
    const detailImages = await Promise.all(detailImagePromises);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        discount: data.discountRate,
        category: {
          connect: data.category.map((id) => ({ id: Number(id) })),
        },
        subCategory: {
          connect: data.subCategory.map((id) => ({ id: Number(id) })),
        },
        stock: data.stock,
        options: data.options,
        delivery: data.delivery,
        productMainImages: {
          create: mainImages.map((image) => ({
            url: image.url,
            filename: image.filename,
            filetype: data.productMainImages[0].type,
          })),
        },
        productImages: {
          create: detailImages.map((image) => ({
            url: image.url,
            filename: image.filename,
            filetype: data.productImages[0].type,
          })),
        },
      },
      include: {
        productMainImages: true,
        productImages: true,
      },
    });

    revalidatePath("/admin/manage-product");
    return {
      success: true,
      message: "상품이 생성되었습니다.",
      data: product,
    };
  } catch (error) {
    console.error("Product creation failed:", error);
    return {
      success: false,
      message: "상품 생성에 실패했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface UpdateProductData {
  id: number;
  productMainImages: File[];
  productImages: File[];
  name: string;
  description: string;
  price: number;
  options: string[];
  delivery: boolean;
  discountRate: number;
  category: string[];
  subCategory: string[];
  stock: number;
  existingMainImages: Array<{ id: number; url: string }>;
  existingDetailImages: Array<{ id: number; url: string }>;
  status: ProductStatus;
  isNew: boolean;
  isRecommended: boolean;
}

export async function updateProduct(
  data: UpdateProductData
): Promise<ServerResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    // Save main images
    const mainImagePromises = data.productMainImages.map((file) =>
      uploadImage(file, "products/main")
    );
    const mainImages = await Promise.all(mainImagePromises);

    // Save detail images
    const detailImagePromises = data.productImages.map((file) =>
      uploadImage(file, "products/detail")
    );
    const detailImages = await Promise.all(detailImagePromises);

    const product = await prisma.product.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        discount: data.discountRate,
        category: {
          set: [],
          connect: data.category.map((id) => ({ id: parseInt(id, 10) })),
        },
        subCategory: {
          set: [],
          connect: data.subCategory.map((id) => ({ id: parseInt(id, 10) })),
        },
        stock: data.stock,
        options: data.options,
        delivery: data.delivery,
        status: data.status,
        isNew: data.isNew,
        isRecommended: data.isRecommended,
        productMainImages: {
          deleteMany: {
            id: {
              notIn: data.existingMainImages.map((img) => img.id),
            },
          },
          create: mainImages.map((image) => ({
            url: image.url,
            filename: image.filename,
            filetype: data.productMainImages[0]?.type ?? "image/jpeg",
          })),
        },
        productImages: {
          deleteMany: {
            id: {
              notIn: data.existingDetailImages.map((img) => img.id),
            },
          },
          create: detailImages.map((image) => ({
            url: image.url,
            filename: image.filename,
            filetype: data.productImages[0]?.type ?? "image/jpeg",
          })),
        },
      },
      include: {
        productMainImages: true,
        productImages: true,
      },
    });

    revalidatePath("/admin/manage-product");
    return {
      success: true,
      message: "상품이 수정되었습니다.",
      data: product,
    };
  } catch (error) {
    console.error("Product update failed:", error);
    return {
      success: false,
      message: "상품 수정에 실패했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteProducts(
  formData: FormData
): Promise<ServerResponse> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    const idsString = formData.get("ids");
    if (!idsString || typeof idsString !== "string") {
      return {
        success: false,
        message: "상품 ID가 올바르지 않습니다.",
      };
    }

    let ids: number[];
    try {
      ids = JSON.parse(idsString);
      if (!Array.isArray(ids) || !ids.every((id) => typeof id === "number")) {
        return {
          success: false,
          message: "상품 ID 형식이 올바르지 않습니다.",
        };
      }
    } catch {
      return {
        success: false,
        message: "상품 ID 형식이 올바르지 않습니다.",
      };
    }

    await prisma.product.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    revalidatePath("/admin/manage-product");
    return {
      success: true,
      message: "선택한 상품이 삭제되었습니다.",
    };
  } catch (error) {
    console.error("Products deletion failed:", error);
    return {
      success: false,
      message: "상품 삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}

export async function deleteProduct(
  formData: FormData
): Promise<ServerResponse> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    const id = Number(formData.get("id"));
    if (isNaN(id)) {
      return {
        success: false,
        message: "상품 ID가 올바르지 않습니다.",
      };
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/manage-product");
    return {
      success: true,
      message: "상품이 삭제되었습니다.",
    };
  } catch (error) {
    console.error("Product deletion failed:", error);
    return {
      success: false,
      message: "상품 삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}

export async function updateProductStatus(
  productId: number,
  status: ProductStatus
): Promise<ServerResponse> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    await prisma.product.update({
      where: { id: productId },
      data: { status },
    });

    revalidatePath("/admin/manage-product");
    return {
      success: true,
      message: "상품 상태가 업데이트되었습니다.",
    };
  } catch (error) {
    console.error("Failed to update product status:", error);
    return {
      success: false,
      message: "상품 상태 업데이트에 실패했습니다.",
    };
  }
}

export async function deleteProductImage(data: {
  id: number;
  type: "main" | "detail";
  productId: number;
}): Promise<ServerResponse<void>> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    // First get the image to get its URL
    const image = await (data.type === "main"
      ? prisma.productMainImage.findUnique({
          where: { id: data.id },
        })
      : prisma.productImage.findUnique({
          where: { id: data.id },
        }));

    if (!image) {
      return {
        success: false,
        message: "이미지를 찾을 수 없습니다.",
      };
    }

    // Delete from database
    if (data.type === "main") {
      await prisma.productMainImage.delete({
        where: {
          id: data.id,
        },
      });
    } else {
      await prisma.productImage.delete({
        where: {
          id: data.id,
        },
      });
    }

    // Delete from filesystem
    const filePath = join(process.cwd(), "public", image.url);
    try {
      await unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error);
      // Don't throw error here as DB deletion was successful
    }

    revalidatePath(`/admin/manage-product/${data.productId}`);
    return {
      success: true,
      message: "이미지가 삭제되었습니다.",
    };
  } catch (error) {
    console.error("Image deletion failed:", error);
    return {
      success: false,
      message: "이미지 삭제에 실패했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function reorderProductImages(data: {
  type: "main" | "detail";
  productId: number;
  imageIds: number[];
}): Promise<ServerResponse> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    await prisma.$transaction(
      data.imageIds.map((id, index) => {
        if (data.type === "main") {
          return prisma.productMainImage.update({
            where: { id },
            data: { order: index },
          });
        } else {
          return prisma.productImage.update({
            where: { id },
            data: { order: index },
          });
        }
      })
    );

    revalidatePath(`/admin/manage-product/${data.productId}`);
    return {
      success: true,
      message: "이미지 순서가 변경되었습니다.",
    };
  } catch (error) {
    console.error("Image reordering failed:", error);
    return {
      success: false,
      message: "이미지 순서 변경에 실패했습니다.",
    };
  }
}
