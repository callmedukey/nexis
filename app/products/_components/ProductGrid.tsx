"use client";

import { ProductCard } from "@/components/ProductCard";

interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  discount: number;
  options: string[];
  productMainImages: Array<{
    url: string;
  }>;
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="col-span-full flex min-h-[200px] items-center justify-center text-muted-foreground">
        등록된 제품이 없습니다
      </div>
    );
  }

  return (
    <>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </>
  );
}
