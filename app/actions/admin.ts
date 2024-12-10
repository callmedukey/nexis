import { unlink } from "fs/promises";
import { join } from "path";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

type ServerResponse<T = void> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};

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
