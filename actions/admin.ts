"use server";

import { createHash } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

import { ProductStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { productSchema } from "@/lib/constants/zod";
import prisma from "@/lib/prisma";

type ServerResponse<T = void> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};

async function generateFileHash(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return createHash("sha1").update(buffer).digest("hex");
}

async function getFileExtension(file: File): Promise<string> {
  // Get extension from original filename
  const ext = path.extname(file.name).toLowerCase();
  if (ext) return ext;

  // Fallback to mime type if no extension
  const mimeToExt: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
  };
  return mimeToExt[file.type] || ".jpg";
}

async function saveFile(
  file: File,
  directory: string
): Promise<{ url: string; filename: string }> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate hash from file content
    const hash = await generateFileHash(file);
    const ext = await getFileExtension(file);

    // Create filename from hash + original extension
    const filename = `${hash}${ext}`;
    const url = path.join(directory, filename);
    const filePath = path.join(process.cwd(), "public", url);

    // Check if file already exists
    try {
      await unlink(filePath);
      console.log(`Replaced existing file: ${filePath}`);
    } catch {
      // File doesn't exist, which is fine
    }

    // Ensure directory exists
    const dirPath = path.dirname(filePath);
    await mkdir(dirPath, { recursive: true });

    // Write file
    await writeFile(filePath, buffer);

    return {
      url: url.replace(/\\/g, "/"), // Convert Windows paths to URL format
      filename,
    };
  } catch (error) {
    console.error("Failed to save file:", error);
    throw new Error("Failed to save file");
  }
}

export async function createProduct(
  data: z.infer<typeof productSchema>
): Promise<
  ServerResponse<
    Prisma.ProductGetPayload<{
      include: { productMainImages: true; productImages: true };
    }>
  >
> {
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
      saveFile(file, "uploads/products/main")
    );
    const mainImages = await Promise.all(mainImagePromises);

    // Save detail images
    const detailImagePromises = data.productImages.map((file) =>
      saveFile(file, "uploads/products/detail")
    );
    const detailImages = await Promise.all(detailImagePromises);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        discount: data.discountRate,
        category: data.category,
        stock: data.stock,
        options: data.options,
        delivery: data.delivery === "탁송",
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

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          message: "동일한 이름의 상품이 이미 존재합니다.",
        };
      }
    }

    return {
      success: false,
      message: "상품 생성에 실패했습니다.",
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
        message: "리자만 접근할 수 있습니다.",
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

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Get all image URLs before deletion
      const products = await tx.product.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        include: {
          productMainImages: true,
          productImages: true,
        },
      });

      // Delete products (cascade will handle related records)
      await tx.product.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });

      // Clean up files after successful deletion
      for (const product of products) {
        const allImages = [
          ...product.productMainImages,
          ...product.productImages,
        ];

        for (const image of allImages) {
          const filePath = path.join(process.cwd(), "public", image.url);
          try {
            await unlink(filePath);
          } catch (error) {
            console.error(`Failed to delete file: ${filePath}`, error);
            // Continue with other files even if one fails
          }
        }
      }
    });

    revalidatePath("/admin/manage-product");
    return {
      success: true,
      message: "선택한 상품이 삭제되었습니다.",
    };
  } catch (error) {
    console.error("Products deletion failed:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        message: "데이터베이스 작업 중 오류가 발생했습니다.",
      };
    }

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
        message: "관리자만 접근할  있습니다.",
      };
    }

    const id = Number(formData.get("id"));
    if (isNaN(id)) {
      return {
        success: false,
        message: "상품 ID가 올바르지 않습니다.",
      };
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const product = await tx.product.findUnique({
        where: { id },
        include: {
          productMainImages: true,
          productImages: true,
        },
      });

      if (!product) {
        return {
          success: false,
          message: "상품을 찾을 수 없습니다.",
        };
      }

      await tx.product.delete({
        where: { id },
      });

      const allImages = [
        ...product.productMainImages,
        ...product.productImages,
      ];

      for (const image of allImages) {
        const filePath = path.join(process.cwd(), "public", image.url);
        try {
          await unlink(filePath);
        } catch (error) {
          console.error(`Failed to delete file: ${filePath}`, error);
          // Continue with other files even if one fails
        }
      }
    });

    revalidatePath("/admin/manage-product");
    return {
      success: true,
      message: "상품이 삭제되었습니다.",
    };
  } catch (error) {
    console.error("Product deletion failed:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        message: "데이터베이스 작업 중 오류가 발생했습니다.",
      };
    }

    return {
      success: false,
      message: "상품 삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}

export async function getProducts(category?: string) {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    const products = await prisma.product.findMany({
      where: category
        ? {
            category: {
              has: category,
            },
          }
        : undefined,
      include: {
        productMainImages: true,
        productImages: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: products.map(
        (
          product: Prisma.ProductGetPayload<{
            include: { productMainImages: true; productImages: true };
          }>
        ) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          discount: product.discount,
          category: product.category,
          stock: product.stock,
          options: product.options,
          delivery: product.delivery,
          status: product.status,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          productMainImages: product.productMainImages.map(
            (img: { url: string }) => img.url
          ),
          productImages: product.productImages.map(
            (img: { url: string }) => img.url
          ),
        })
      ),
    };
  } catch (error) {
    console.error("Failed to get products:", error);
    return {
      success: false,
      message: "상품 목록을 가져오는데 실패했습니다.",
    };
  }
}

export async function updateProductStatus(
  productId: number,
  status: ProductStatus
) {
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

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          message: "상품을 찾을 수 없습니다.",
        };
      }
    }

    return {
      success: false,
      message: "상품 상태 업데이트에 실패했습니다.",
    };
  }
}

export async function updateProduct({
  id,
  productMainImages,
  productImages,
  name,
  description,
  price,
  options,
  delivery,
  discountRate,
  category,
  stock,
  existingMainImages,
  existingDetailImages,
}: {
  id: number;
  productMainImages: File[];
  productImages: File[];
  name: string;
  description: string;
  price: number;
  options: string[];
  delivery: "탁송" | "직수령";
  discountRate: number;
  category: string[];
  stock: number;
  existingMainImages: { id: number; url: string }[];
  existingDetailImages: { id: number; url: string }[];
}) {
  // Keep track of new files to clean up in case of error
  const newFiles: string[] = [];

  try {
    // Delete removed images
    const existingMainImageIds = existingMainImages.map((img) => img.id);
    const existingDetailImageIds = existingDetailImages.map((img) => img.id);

    // Get images to delete
    const imagesToDelete = await prisma.$transaction([
      prisma.productMainImage.findMany({
        where: {
          productId: id,
          id: {
            notIn: existingMainImageIds,
          },
        },
      }),
      prisma.productImage.findMany({
        where: {
          productId: id,
          id: {
            notIn: existingDetailImageIds,
          },
        },
      }),
    ]);

    // Delete the database records
    await prisma.$transaction([
      prisma.productMainImage.deleteMany({
        where: {
          productId: id,
          id: {
            notIn: existingMainImageIds,
          },
        },
      }),
      prisma.productImage.deleteMany({
        where: {
          productId: id,
          id: {
            notIn: existingDetailImageIds,
          },
        },
      }),
    ]);

    // Delete the actual files
    const allImagesToDelete = [...imagesToDelete[0], ...imagesToDelete[1]];
    for (const image of allImagesToDelete) {
      const filePath = path.join(process.cwd(), "public", image.url);
      try {
        await unlink(filePath);
      } catch (error) {
        console.error(`Failed to delete file: ${filePath}`, error);
      }
    }

    // Upload new images
    const mainImagePromises = productMainImages.map((file) =>
      saveFile(file, "uploads/products/main")
    );
    const mainImages = await Promise.all(mainImagePromises);
    mainImages.forEach((img) => newFiles.push(img.url));

    const detailImagePromises = productImages.map((file) =>
      saveFile(file, "uploads/products/detail")
    );
    const detailImages = await Promise.all(detailImagePromises);
    detailImages.forEach((img) => newFiles.push(img.url));

    // Update product and add new images
    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        price,
        options,
        delivery: delivery === "탁송",
        discount: discountRate,
        category,
        stock,
        productMainImages: {
          create: mainImages.map((image) => ({
            url: image.url,
            filename: image.filename,
            filetype: productMainImages[0]?.type ?? "image/jpeg",
          })),
        },
        productImages: {
          create: detailImages.map((image) => ({
            url: image.url,
            filename: image.filename,
            filetype: productImages[0]?.type ?? "image/jpeg",
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
      data: updatedProduct,
    };
  } catch (error) {
    // Clean up any new files that were created before the error
    for (const file of newFiles) {
      const filePath = path.join(process.cwd(), "public", file);
      try {
        await unlink(filePath);
      } catch (cleanupError) {
        console.error(
          `Failed to clean up file after error: ${filePath}`,
          cleanupError
        );
      }
    }

    console.error("Failed to update product:", error);
    return {
      success: false,
      error: "상품 수정에 실패했습니다",
    };
  }
}

const deleteImageSchema = z
  .object({
    id: z.number(),
    type: z.enum(["main", "detail"]),
    productId: z.number(),
  })
  .strict();

export async function deleteProductImage(
  data: unknown
): Promise<ServerResponse> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    // Validate input
    const result = await deleteImageSchema.safeParseAsync(data);
    if (!result.success) {
      return {
        success: false,
        message: "잘못된 요청입니다.",
        errors: result.error.flatten().fieldErrors,
      };
    }

    const { id, type, productId } = result.data;

    // Start transaction
    const image = await prisma.$transaction(async (tx) => {
      // Find the image first to get the URL
      const image =
        type === "main"
          ? await tx.productMainImage.findUnique({
              where: { id, productId },
            })
          : await tx.productImage.findUnique({
              where: { id, productId },
            });

      if (!image) {
        throw new Error("이미지를 찾을 수 없습니다.");
      }

      // Delete from database
      if (type === "main") {
        await tx.productMainImage.delete({
          where: { id },
        });
      } else {
        await tx.productImage.delete({
          where: { id },
        });
      }

      return image;
    });

    // After successful DB deletion, delete the file
    if (image) {
      const filePath = path.join(process.cwd(), "public", image.url);
      try {
        await unlink(filePath);
      } catch (error) {
        console.error(`Failed to delete file: ${filePath}`, error);
        // Don't throw error here as DB deletion was successful
      }
    }

    revalidatePath("/admin/manage-product");
    return {
      success: true,
      message: "이미지가 삭제되었습니다.",
    };
  } catch (error) {
    console.error("Image deletion failed:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "이미지 삭제에 실패했습니다.",
    };
  }
}

const reorderImagesSchema = z
  .object({
    type: z.enum(["main", "detail"]),
    productId: z.number(),
    imageIds: z.array(z.number()),
  })
  .strict();

export async function reorderProductImages(
  data: unknown
): Promise<ServerResponse> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    // Validate input
    const result = await reorderImagesSchema.safeParseAsync(data);
    if (!result.success) {
      return {
        success: false,
        message: "잘못된 요청입니다.",
        errors: result.error.flatten().fieldErrors,
      };
    }

    const { type, imageIds } = result.data;

    // Update orders in transaction
    await prisma.$transaction(async (tx) => {
      const updates = imageIds.map((id, index) => {
        if (type === "main") {
          return tx.productMainImage.update({
            where: { id },
            data: { order: index },
          });
        } else {
          return tx.productImage.update({
            where: { id },
            data: { order: index },
          });
        }
      });

      await Promise.all(updates);
    });

    revalidatePath("/admin/manage-product");
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

const uploadImagesSchema = z.object({
  type: z.enum(["main", "detail"]),
  productId: z.number(),
  images: z.array(z.instanceof(File)),
}).strict();

export async function uploadProductImages(
  data: unknown
): Promise<ServerResponse> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    // Validate input
    const result = await uploadImagesSchema.safeParseAsync(data);
    if (!result.success) {
      return {
        success: false,
        message: "잘못된 요청입니다.",
        errors: result.error.flatten().fieldErrors,
      };
    }

    const { type, productId, images } = result.data;

    // Get current max order
    const currentMaxOrder = type === "main"
      ? await prisma.productMainImage.findFirst({
          where: { productId },
          orderBy: { order: 'desc' },
          select: { order: true }
        })
      : await prisma.productImage.findFirst({
          where: { productId },
          orderBy: { order: 'desc' },
          select: { order: true }
        });

    const startOrder = (currentMaxOrder?.order ?? -1) + 1;

    // Save images
    const imagePromises = images.map((file) =>
      saveFile(file, `uploads/products/${type}`)
    );
    const savedImages = await Promise.all(imagePromises);

    // Create image records
    if (type === "main") {
      await prisma.productMainImage.createMany({
        data: savedImages.map((image, index) => ({
          url: image.url,
          filename: image.filename,
          filetype: images[0].type,
          productId,
          order: startOrder + index,
        })),
      });
    } else {
      await prisma.productImage.createMany({
        data: savedImages.map((image, index) => ({
          url: image.url,
          filename: image.filename,
          filetype: images[0].type,
          productId,
          order: startOrder + index,
        })),
      });
    }

    revalidatePath(`/admin/manage-product/${productId}`);
    revalidatePath(`/admin/manage-product/add/${productId}`);
    return {
      success: true,
      message: "이미지가 업로드되었습니다.",
    };
  } catch (error) {
    console.error("Image upload failed:", error);
    return {
      success: false,
      message: "이미지 업로드에 실패했습니다.",
    };
  }
}
