"use client";

import { Category, ProductStatus, type Product } from "@prisma/client";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/general";
import { cn } from "@/lib/utils";

import ManageProductScreenTab from "./ManageProductScreenTab";

const ManageProductScreen = ({
  products,
}: {
  products: (Product & { category: Category[] })[];
}) => {
  const { ACTIVE, INACTIVE, SOLDOUT } = useMemo(() => {
    return {
      ACTIVE: products.filter(
        (product) => product.status === ProductStatus.ACTIVE
      ),
      INACTIVE: products.filter(
        (product) => product.status === ProductStatus.INACTIVE
      ),
      SOLDOUT: products.filter(
        (product) => product.status === ProductStatus.SOLDOUT
      ),
    };
  }, [products]);
  const [activeTab, setActiveTab] = useState<ProductStatus | "ALL">("ALL");

  return (
    <article className="min-h-screen flex-1">
      <div>
        <div className="flex gap-12 px-6 py-4">
          <button
            onClick={() => setActiveTab("ALL")}
            className={cn(activeTab === "ALL" && "font-bold")}
          >
            전체 {products.length ?? "0"}
          </button>
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={cn(activeTab === "ACTIVE" && "font-bold")}
          >
            판매중 {ACTIVE.length ?? "0"}
          </button>
          <button
            onClick={() => setActiveTab("INACTIVE")}
            className={cn(activeTab === "INACTIVE" && "font-bold")}
          >
            품절 {INACTIVE.length ?? "0"}
          </button>
          <button
            onClick={() => setActiveTab("SOLDOUT")}
            className={cn(activeTab === "SOLDOUT" && "font-bold")}
          >
            숨김 {SOLDOUT.length ?? "0"}
          </button>
        </div>
        <ManageProductScreenTab products={products} />
      </div>
      <div className="fixed inset-x-0 bottom-0 flex h-20 justify-between gap-4 border-t bg-white px-6 py-4">
        <Button
          variant="ringHover"
          className="bg-primaryblue hover:bg-primaryblue/90 hover:ring-primaryblue/90"
          asChild
        >
          <Link href={ROUTES.MANAGE_PRODUCT_ADD}>상품 추가</Link>
        </Button>
        <Button variant="outline">선택 삭제</Button>
      </div>
      <div className="h-20 w-full" />
    </article>
  );
};

export default ManageProductScreen;
