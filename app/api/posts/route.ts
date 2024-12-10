import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ServerResponse } from "@/lib/types";
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
      return ServerResponse.error("Invalid input");
    }

    const { title, content, thumbnailId } = result.data;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        ...(thumbnailId && {
          thumbnail: {
            connect: {
              id: thumbnailId,
            },
          },
        }),
      },
    });

    return ServerResponse.success(post);
  } catch (error) {
    console.error("[POSTS]", error);
    return ServerResponse.error("Internal error");
  }
} 