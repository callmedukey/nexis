import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

import EditProductForm from "./_components/EditProductForm";
import type { ProductFormState } from "../add/_providers/ContextProvider";
import ContextProvider from "../add/_providers/ContextProvider";

interface Props {
  params: {
    id: string;
  };
}

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
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
      return {
        success: false,
        message: "상품을 찾을 수 없습니다.",
        errors: { id: ["Invalid product ID"] },
      } as const;
    }

    return {
      success: true,
      data: product,
    } as const;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return {
      success: false,
      message: "상품 정보를 불러오는데 실패했습니다.",
      errors: error instanceof Error ? { server: [error.message] } : undefined,
    } as const;
  }
}

function LoadingFallback() {
  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>상품 수정</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
          <div className="space-y-4">
            <div className="h-10 w-1/3 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-10 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-10 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function EditProductPage({ params }: Props) {
  const session = await auth();
  if (!session?.user.isAdmin) {
    redirect("/");
  }

  // Handle route parameter according to the guidelines
  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) {
    redirect("/admin/manage-product");
  }

  const result = await getProduct(id);

  if (!result.success) {
    console.error("Product fetch failed:", result.errors);
    redirect("/admin/manage-product");
  }

  const product = result.data;

  // Transform product data for the context
  const initialData: ProductFormState = {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    price: product.price,
    discountRate: product.discount,
    category: product.category,
    stock: product.stock,
    options: product.options,
    delivery: product.delivery ? "탁송" : "직수령",
    productMainImages: [], // New images to be uploaded
    productImages: [], // New images to be uploaded
    existingMainImages: product.productMainImages.map((img) => ({
      id: img.id,
      url: img.url.startsWith("/") ? img.url : `/${img.url}`,
    })),
    existingDetailImages: product.productImages.map((img) => ({
      id: img.id,
      url: img.url.startsWith("/") ? img.url : `/${img.url}`,
    })),
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ContextProvider initialData={initialData}>
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>상품 수정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <EditProductForm />
            </div>
          </CardContent>
        </Card>
      </ContextProvider>
    </Suspense>
  );
}
