import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  thumbnailId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const result = await postSchema.safeParseAsync(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const { title, content, thumbnailId } = result.data;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        ...(thumbnailId && {
          thumbnail: {
            create: {
              url: `/uploads/posts/${thumbnailId}`,
              filename: thumbnailId,
              filetype: thumbnailId.split(".").pop() || "png",
            },
          },
        }),
      },
      include: {
        thumbnail: true,
      },
    });

    return NextResponse.json({ success: true, data: post }, { status: 200 });
  } catch (error) {
    console.error("[POSTS]", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
