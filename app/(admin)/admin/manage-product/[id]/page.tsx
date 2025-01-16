import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

import EditProductForm from "./_components/EditProductForm";
import ContextProvider, {
  ProductFormState,
} from "../add/_providers/ContextProvider";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: Props) {
  const session = await auth();
  if (!session?.user.isAdmin) {
    redirect("/");
  }

  // Await the route parameter
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    redirect("/admin/manage-product");
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      category: true,
      subCategory: true,
      productMainImages: {
        orderBy: {
          order: "asc",
        },
      },
      productImages: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const initialData: ProductFormState = {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: product.price,
    discountRate: product.discount,
    stock: product.stock,
    delivery: product.delivery,
    options: product.options,
    categories: product.category.map((cat) => ({
      categoryId: cat.id,
      subCategoryIds: product.subCategory
        .filter((sub) => sub.categoryId === cat.id)
        .map((sub) => sub.id),
    })),
    productMainImages: [],
    productImages: [],
    existingMainImages: product.productMainImages.map((image) => ({
      id: image.id,
      url: image.url,
    })),
    existingDetailImages: product.productImages.map((image) => ({
      id: image.id,
      url: image.url,
    })),
    status: product.status,
    isNew: product.isNew,
    isRecommended: product.isRecommended,
    specialDelivery: product.specialDelivery,
  };

  const categories = await prisma.category.findMany({
    include: {
      subCategory: true,
    },
  });

  return (
    <div className="mx-auto max-w-3xl py-12">
      <ContextProvider initialData={initialData}>
        <EditProductForm initialCategories={categories} />
      </ContextProvider>
    </div>
  );
}
