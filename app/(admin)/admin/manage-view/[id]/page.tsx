import { redirect } from "next/navigation";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

import PostForm from "../_components/PostForm";

interface Props {
  params: {
    id: string;
  };
}

export default async function Page({ params }: Props) {
  const session = await auth();
  if (!session?.user.isAdmin) {
    redirect("/");
  }

  const { id } = await params;

  // Handle the "new" route
  if (id === "new") {
    return (
      <main className="min-h-screen bg-lightgray">
        <div className="p-8">
          <div className="rounded-lg bg-white p-4 md:p-8">
            <PostForm />
          </div>
        </div>
      </main>
    );
  }

  const post = await prisma.post.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      thumbnail: true,
    },
  });

  if (!post) {
    redirect("/admin/manage-view");
  }

  return (
    <main className="min-h-screen bg-lightgray">
      <div className="p-8">
        <div className="rounded-lg bg-white p-4 md:p-8">
          <PostForm initialData={post} />
        </div>
      </div>
    </main>
  );
}
