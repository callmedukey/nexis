import { redirect } from "next/navigation";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

import { CategoryManager } from "./_components/CategoryManager";

export const dynamic = "force-dynamic";

export default async function ManageCategoryPage() {
  const session = await auth();
  if (!session?.user.isAdmin) {
    redirect("/");
  }

  const categories = await prisma.category.findMany({
    include: {
      subCategory: {
        include: {
          categoryThumbnail: true,
        },
      },
      categoryThumbnail: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-bold">카테고리 관리</h1>
        <p className="text-muted-foreground">
          카테고리와 하위 카테고리를 관리할 수 있습니다
        </p>
      </div>

      <CategoryManager initialCategories={categories} />
    </div>
  );
}
