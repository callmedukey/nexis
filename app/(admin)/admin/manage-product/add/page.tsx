import { redirect } from "next/navigation";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

import AddProductForm from "./_components/AddProductForm";
import ContextProvider from "./_providers/ContextProvider";

export default async function Page() {
  const session = await auth();
  if (!session?.user.isAdmin) {
    redirect("/");
  }

  const categories = await prisma.category.findMany({
    include: {
      subCategory: true,
    },
  });

  return (
    <div className="mx-auto max-w-3xl py-12">
      <ContextProvider>
        <AddProductForm initialCategories={categories} />
      </ContextProvider>
    </div>
  );
}
