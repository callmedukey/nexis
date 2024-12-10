"use server";

import { unlink } from "fs/promises";
import path, { join } from "path";

import { ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
        isNew: data.isNew,
        isRecommended: data.isRecommended,
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

    // First, get all images associated with these products
    const products = await prisma.product.findMany({
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

    // Delete the products from the database
    await prisma.product.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    // After successful DB deletion, delete the files
    const deletePromises: Promise<void>[] = [];
    products.forEach((product) => {
      // Delete main images
      product.productMainImages.forEach((image) => {
        const filePath = join(process.cwd(), "public", image.url);
        deletePromises.push(
          unlink(filePath).catch((error) => {
            console.error(`Failed to delete file: ${filePath}`, error);
          })
        );
      });

      // Delete detail images
      product.productImages.forEach((image) => {
        const filePath = join(process.cwd(), "public", image.url);
        deletePromises.push(
          unlink(filePath).catch((error) => {
            console.error(`Failed to delete file: ${filePath}`, error);
          })
        );
      });
    });

    // Wait for all file deletions to complete
    await Promise.all(deletePromises);

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

    // First, get the product with its images
    const product = await prisma.product.findUnique({
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

    // Delete from database
    await prisma.product.delete({
      where: { id },
    });

    // After successful DB deletion, delete the files
    const deletePromises: Promise<void>[] = [];

    // Delete main images
    product.productMainImages.forEach((image) => {
      const filePath = join(process.cwd(), "public", image.url);
      deletePromises.push(
        unlink(filePath).catch((error) => {
          console.error(`Failed to delete file: ${filePath}`, error);
        })
      );
    });

    // Delete detail images
    product.productImages.forEach((image) => {
      const filePath = join(process.cwd(), "public", image.url);
      deletePromises.push(
        unlink(filePath).catch((error) => {
          console.error(`Failed to delete file: ${filePath}`, error);
        })
      );
    });

    // Wait for all file deletions to complete
    await Promise.all(deletePromises);

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

const postSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  thumbnailId: z.string().optional(),
});

export async function createPost(
  data: z.infer<typeof postSchema>
): Promise<ServerResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    const result = await postSchema.safeParseAsync(data);
    if (!result.success) {
      return {
        success: false,
        message: "Invalid input data",
        errors: result.error.flatten().fieldErrors,
      };
    }

    const thumbnailIds = result.data.thumbnailId?.split(",").filter(Boolean);

    const post = await prisma.post.create({
      data: {
        title: result.data.title,
        content: result.data.content,
        thumbnail: thumbnailIds?.length
          ? {
              create: thumbnailIds.map((filename) => ({
                url: `/uploads/posts/${filename}`,
                filename,
                filetype: filename.split(".").pop() || "png",
              })),
            }
          : undefined,
      },
      include: {
        thumbnail: true,
      },
    });

    revalidatePath("/admin/manage-view");
    return {
      success: true,
      message: "게시물이 생성되었습니다.",
      data: post,
    };
  } catch (error) {
    console.error("Post creation failed:", error);
    return {
      success: false,
      message: "게시물 생성에 실패했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updatePost(
  id: number,
  data: z.infer<typeof postSchema>
): Promise<ServerResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    const result = await postSchema.safeParseAsync(data);
    if (!result.success) {
      return {
        success: false,
        message: "Invalid input data",
        errors: result.error.flatten().fieldErrors,
      };
    }

    const thumbnailIds = result.data.thumbnailId?.split(",").filter(Boolean);

    // First, delete all existing thumbnails
    await prisma.postThumbnail.deleteMany({
      where: { postId: id },
    });

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: result.data.title,
        content: result.data.content,
        thumbnail: thumbnailIds?.length
          ? {
              create: thumbnailIds.map((filename) => ({
                url: `/uploads/posts/${filename}`,
                filename,
                filetype: filename.split(".").pop() || "png",
              })),
            }
          : undefined,
      },
      include: {
        thumbnail: true,
      },
    });

    revalidatePath("/admin/manage-view");
    return {
      success: true,
      message: "게시물이 수정되었습니다.",
      data: post,
    };
  } catch (error) {
    console.error("Post update failed:", error);
    return {
      success: false,
      message: "게시물 수정에 실패했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deletePost(postIds: number[]): Promise<ServerResponse> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    // Delete posts and their thumbnails
    for (const postId of postIds) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { thumbnail: true },
      });

      if (post) {
        // Delete thumbnail files
        for (const thumbnail of post.thumbnail) {
          try {
            const filePath = path.join(process.cwd(), "public", thumbnail.url);
            await unlink(filePath);
          } catch (error) {
            console.error(
              `Failed to delete thumbnail file for post ${postId}:`,
              error
            );
          }
        }

        // Delete post and related records
        await prisma.post.delete({ where: { id: postId } });
      }
    }

    revalidatePath("/admin/manage-view");
    return {
      success: true,
      message: "게시물이 삭제되었습니다.",
    };
  } catch (error) {
    console.error("Post deletion failed:", error);
    return {
      success: false,
      message: "게시물 삭제에 실패했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getPost(postId: number) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        thumbnail: true,
      },
    });

    if (!post) {
      return { success: false, message: "게시물을 찾을 수 없습니다" };
    }

    return { success: true, data: post };
  } catch (error) {
    console.error("[GET_POST]", error);
    return { success: false, message: "게시물을 불러오는데 실패했습니다" };
  }
}

export async function getPosts(params: {
  page?: number;
  limit?: number;
  query?: string;
}) {
  try {
    const { page = 1, limit = 100, query } = params;
    const skip = (page - 1) * limit;

    const where = query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { content: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          thumbnail: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return {
      success: true,
      data: {
        posts,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[GET_POSTS]", error);
    return { success: false, message: "게시물 목록을 불러오는데 실패했습니다" };
  }
}

export async function uploadPostImages(files: File[]) {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, "posts"));
    const uploadResults = await Promise.all(uploadPromises);
    return {
      success: true,
      data: uploadResults,
    } satisfies ServerResponse<{ url: string; filename: string }[]>;
  } catch (error) {
    console.error("Image upload failed:", error);
    return {
      success: false,
      message: "Failed to upload images",
      error: error instanceof Error ? error.message : "Unknown error",
    } satisfies ServerResponse;
  }
}

export async function deletePostThumbnail(data: {
  id: number;
  postId: number;
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
    const thumbnail = await prisma.postThumbnail.findUnique({
      where: { id: data.id },
    });

    if (!thumbnail) {
      return {
        success: false,
        message: "이미지를 찾을 수 없습니다.",
      };
    }

    // Delete from database
    await prisma.postThumbnail.delete({
      where: { id: data.id },
    });

    // Delete from filesystem
    const filePath = join(process.cwd(), "public", thumbnail.url);
    try {
      await unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error);
      // Don't throw error here as DB deletion was successful
    }

    revalidatePath(`/admin/manage-view/${data.postId}`);
    return {
      success: true,
      message: "이미지가 삭제되었습니다.",
    };
  } catch (error) {
    console.error("Thumbnail deletion failed:", error);
    return {
      success: false,
      message: "이미지 삭제에 실패했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
