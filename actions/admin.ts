"use server";

import { unlink } from "fs/promises";
import path, { join } from "path";

import { BusCategory, ProductStatus } from "@prisma/client";
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

// Category Actions
export const createCategory = async (data: {
  name: string;
  thumbnail?: File | null;
}): Promise<ServerResponse> => {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
      },
    });

    if (data.thumbnail) {
      const { url, filename } = await uploadImage(data.thumbnail, "categories");
      await prisma.categoryThumbnail.create({
        data: {
          url,
          filename,
          filetype: data.thumbnail.type,
          categoryId: category.id,
        },
      });
    }

    revalidatePath("/admin/manage-category");
    return {
      success: true,
      message: "카테고리가 생성되었습니다.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "카테고리 생성에 실패했습니다.",
    };
  }
};

export const updateCategory = async (data: {
  id: number;
  name: string;
  thumbnail?: File | null;
}): Promise<ServerResponse> => {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    await prisma.category.update({
      where: { id: data.id },
      data: {
        name: data.name,
      },
    });

    if (data.thumbnail) {
      const { url, filename } = await uploadImage(data.thumbnail, "categories");
      await prisma.categoryThumbnail.create({
        data: {
          url,
          filename,
          filetype: data.thumbnail.type,
          categoryId: data.id,
        },
      });
    }

    revalidatePath("/admin/manage-category");
    return {
      success: true,
      message: "카테고리가 수정되었습니다.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "카테고리 수정에 실패했습니다.",
    };
  }
};

export const deleteCategory = async (id: number): Promise<ServerResponse> => {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    // First get the category with its thumbnails
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        categoryThumbnail: true,
      },
    });

    if (!category) {
      return {
        success: false,
        message: "카테고리를 찾을 수 없습니다.",
      };
    }

    // Delete thumbnail files from filesystem
    for (const thumbnail of category.categoryThumbnail) {
      const filePath = join(process.cwd(), "public", thumbnail.url);
      try {
        await unlink(filePath);
      } catch (error) {
        console.error(`Failed to delete thumbnail file: ${filePath}`, error);
      }
    }

    // Delete category (this will cascade delete thumbnails in DB)
    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/manage-category");
    return {
      success: true,
      message: "카테고리가 삭제되었습니다.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "카테고리 삭제에 실패했습니다.",
    };
  }
};

// SubCategory Actions
export const createSubCategory = async (data: {
  name: string;
  categoryId: number;
  thumbnail?: File | null;
}): Promise<ServerResponse> => {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    const subCategory = await prisma.subCategory.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
      },
    });

    if (data.thumbnail) {
      const { url, filename } = await uploadImage(data.thumbnail, "categories");
      await prisma.categoryThumbnail.create({
        data: {
          url,
          filename,
          filetype: data.thumbnail.type,
          subCategoryId: subCategory.id,
        },
      });
    }

    revalidatePath("/admin/manage-category");
    return {
      success: true,
      message: "하위 카테고리 생성되었습니다.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "하위 카테고리 생성에 실패했습니다.",
    };
  }
};

export const updateSubCategory = async (data: {
  id: number;
  name: string;
  categoryId: number;
  thumbnail?: File | null;
}): Promise<ServerResponse> => {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    await prisma.subCategory.update({
      where: { id: data.id },
      data: {
        name: data.name,
        categoryId: data.categoryId,
      },
    });

    if (data.thumbnail) {
      const { url, filename } = await uploadImage(data.thumbnail, "categories");
      await prisma.categoryThumbnail.create({
        data: {
          url,
          filename,
          filetype: data.thumbnail.type,
          subCategoryId: data.id,
        },
      });
    }

    revalidatePath("/admin/manage-category");
    return {
      success: true,
      message: "하위 카테고리가 수정되었습니다.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "하위 카테고리 수정에 실패했습니다.",
    };
  }
};

export const deleteSubCategory = async (
  id: number
): Promise<ServerResponse> => {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    // First get the subcategory with its thumbnails
    const subCategory = await prisma.subCategory.findUnique({
      where: { id },
      include: {
        categoryThumbnail: true,
      },
    });

    if (!subCategory) {
      return {
        success: false,
        message: "하위 카테고리를 찾을 수 없습니다.",
      };
    }

    // Delete thumbnail files from filesystem
    for (const thumbnail of subCategory.categoryThumbnail) {
      const filePath = join(process.cwd(), "public", thumbnail.url);
      try {
        await unlink(filePath);
      } catch (error) {
        console.error(`Failed to delete thumbnail file: ${filePath}`, error);
      }
    }

    // Delete subcategory (this will cascade delete thumbnails in DB)
    await prisma.subCategory.delete({
      where: { id },
    });

    revalidatePath("/admin/manage-category");
    return {
      success: true,
      message: "하위 카테고리가 삭제되었습니다.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "하위 카테고리 삭제�� 실패했습니다.",
    };
  }
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
      message: "���품 상태 업데이트에 실패했습니다.",
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
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  thumbnailId: z.string().optional(),
  busCategoryIds: z.array(z.string()).min(1, "카테고리를 선택해주세요"),
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
        busCategory: {
          connect: result.data.busCategoryIds.map((id) => ({ id: parseInt(id) })),
        },
      },
      include: {
        thumbnail: true,
        busCategory: true,
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
        busCategory: {
          set: result.data.busCategoryIds.map((id) => ({ id: parseInt(id) })),
        },
      },
      include: {
        thumbnail: true,
        busCategory: true,
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

const busCategorySchema = z.object({
  name: z.string().min(1, "카테고리 이름을 입력해주세요"),
});

export async function createBusCategory(data: {
  name: string;
}): Promise<ServerResponse<BusCategory>> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    const validated = await busCategorySchema.safeParseAsync(data);
    if (!validated.success) {
      return {
        success: false,
        message: "유효하지 않은 값입니다.",
      };
    }

    const category = await prisma.busCategory.create({
      data: validated.data,
    });

    return {
      success: true,
      message: "카테고리가 생성되었습니다.",
      data: category,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "카테고리 생성에 실패했습니다.",
    };
  }
}

export async function updateBusCategory(data: {
  id: number;
  name: string;
}): Promise<ServerResponse<BusCategory>> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    const validated = await busCategorySchema.safeParseAsync({
      name: data.name,
    });
    if (!validated.success) {
      return {
        success: false,
        message: "유효하지 않은 값입니다.",
      };
    }

    const category = await prisma.busCategory.update({
      where: { id: data.id },
      data: validated.data,
    });

    return {
      success: true,
      message: "카테고리가 수정되었습니다.",
      data: category,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "카테고리 수정에 실패했습니다.",
    };
  }
}

export async function deleteBusCategory(id: number): Promise<ServerResponse> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    await prisma.busCategory.delete({
      where: { id },
    });

    return {
      success: true,
      message: "카테고리가 삭제되었습니다.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "카테고리 삭제에 실패했습니다.",
    };
  }
}

const eventSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().optional(),
  thumbnailId: z.string().optional(),
  active: z.boolean().default(true),
});

export async function createEvent(
  data: z.infer<typeof eventSchema>
): Promise<ServerResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    const result = await eventSchema.safeParseAsync(data);
    if (!result.success) {
      return {
        success: false,
        message: "Invalid input data",
        errors: result.error.flatten().fieldErrors,
      };
    }

    const thumbnailIds = result.data.thumbnailId?.split(",").filter(Boolean);

    const event = await prisma.events.create({
      data: {
        title: result.data.title,
        content: result.data.content,
        active: result.data.active,
        thumbnail: thumbnailIds?.length
          ? {
              create: thumbnailIds.map((filename) => ({
                url: `/uploads/events/${filename}`,
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

    revalidatePath("/admin/manage-events");
    return {
      success: true,
      message: "이벤트가 생성되었습니다.",
      data: event,
    };
  } catch (error) {
    console.error("Event creation failed:", error);
    return {
      success: false,
      message: "이벤트 생성에 실패했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateEvent(
  id: number,
  data: z.infer<typeof eventSchema>
): Promise<ServerResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    const result = await eventSchema.safeParseAsync(data);
    if (!result.success) {
      return {
        success: false,
        message: "Invalid input data",
        errors: result.error.flatten().fieldErrors,
      };
    }

    const thumbnailIds = result.data.thumbnailId?.split(",").filter(Boolean);

    // First, delete all existing thumbnails
    await prisma.eventsThumbnail.deleteMany({
      where: { eventsId: id },
    });

    const event = await prisma.events.update({
      where: { id },
      data: {
        title: result.data.title,
        content: result.data.content,
        active: result.data.active,
        thumbnail: thumbnailIds?.length
          ? {
              create: thumbnailIds.map((filename) => ({
                url: `/uploads/events/${filename}`,
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

    revalidatePath("/admin/manage-events");
    return {
      success: true,
      message: "이벤트가 수정되었습니다.",
      data: event,
    };
  } catch (error) {
    console.error("Event update failed:", error);
    return {
      success: false,
      message: "이벤트 수정에 실패했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteEvent(id: number): Promise<ServerResponse<void>> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    // First get the event with its thumbnails
    const event = await prisma.events.findUnique({
      where: { id },
      include: {
        thumbnail: true,
      },
    });

    if (!event) {
      return {
        success: false,
        message: "이벤트를 찾을 수 없습니다.",
      };
    }

    // Delete thumbnail files from filesystem
    for (const thumbnail of event.thumbnail) {
      const filePath = join(process.cwd(), "public", thumbnail.url);
      try {
        await unlink(filePath);
      } catch (error) {
        console.error(`Failed to delete thumbnail file: ${filePath}`, error);
      }
    }

    // Delete event (this will cascade delete thumbnails in DB)
    await prisma.events.delete({
      where: { id },
    });

    revalidatePath("/admin/manage-events");
    return {
      success: true,
      message: "이벤트가 삭제되었습니다.",
    };
  } catch (error) {
    console.error("Event deletion failed:", error);
    return {
      success: false,
      message: "이벤트 삭제에 실패했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function uploadEventImages(files: File[]) {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, "events"));
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

export async function deleteEventThumbnail(data: {
  id: number;
  eventsId: number;
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
    const thumbnail = await prisma.eventsThumbnail.findUnique({
      where: { id: data.id },
    });

    if (!thumbnail) {
      return {
        success: false,
        message: "이미지를 찾을 수 없습니다.",
      };
    }

    // Delete from database
    await prisma.eventsThumbnail.delete({
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

    revalidatePath(`/admin/manage-events/${data.eventsId}`);
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

export async function searchProducts(query: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
        status: "ACTIVE",
      },
      include: {
        productMainImages: {
          orderBy: {
            order: "asc",
          },
          take: 1,
        },
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: products };
  } catch (error) {
    console.error("Failed to search products:", error);
    return { success: false, error: "상품 검색에 실패했습니다." };
  }
}

// Coupon Actions
export async function createCoupon(data: {
  code: string;
  active: boolean;
  flatDiscount: number | null;
  discountRate: number | null;
}): Promise<ServerResponse> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        active: data.active,
        flatDiscount: data.flatDiscount,
        discountRate: data.discountRate,
      },
    });

    revalidatePath("/admin/manage-coupons");
    return {
      success: true,
      message: "쿠폰이 생성되었습니다.",
      data: coupon,
    };
  } catch (error) {
    console.error("Coupon creation failed:", error);
    return {
      success: false,
      message: "쿠폰 생성에 실패했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteCoupons(ids: number[]): Promise<ServerResponse> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    await prisma.coupon.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    revalidatePath("/admin/manage-coupons");
    return {
      success: true,
      message: "선택한 쿠폰이 삭제되었습���다.",
    };
  } catch (error) {
    console.error("Coupons deletion failed:", error);
    return {
      success: false,
      message: "쿠폰 삭제에 실패했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getCoupons() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return coupons;
  } catch (error) {
    console.error("Failed to get coupons:", error);
    throw new Error("쿠폰 목록을 불러오는데 실패했습니다.");
  }
}

export async function updateCoupon(data: {
  id: number
  code: string
  active: boolean
  flatDiscount: number | null
  discountRate: number | null
}): Promise<ServerResponse> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    const coupon = await prisma.coupon.update({
      where: { id: data.id },
      data: {
        code: data.code,
        active: data.active,
        flatDiscount: data.flatDiscount,
        discountRate: data.discountRate,
      },
    });

    revalidatePath("/admin/manage-coupons");
    return {
      success: true,
      message: "쿠폰이 수정되었습니다.",
      data: coupon,
    };
  } catch (error) {
    console.error("Coupon update failed:", error);
    return {
      success: false,
      message: "쿠폰 수정에 실패했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// User Actions
export async function deleteUsers(data: {
  userIds: string[];
}): Promise<ServerResponse<void>> {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return {
        success: false,
        message: "관리자만 접근할 수 있습니다.",
      };
    }

    await prisma.user.deleteMany({
      where: {
        id: {
          in: data.userIds,
        },
      },
    });

    revalidatePath("/admin/manage-user");
    return {
      success: true,
      message: "사용자가 삭제되었습니다.",
    };
  } catch (error) {
    console.error("[DELETE_USERS]", error);
    return {
      success: false,
      message: "사용자 삭제에 실패했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}