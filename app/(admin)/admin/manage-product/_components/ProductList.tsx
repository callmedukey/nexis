"use client";

import { ProductStatus } from "@prisma/client";
import { Check, ChevronDown, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { deleteProducts, updateProductStatus } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

const formatProductId = (id: number) => {
  return String(id).padStart(5, "0");
};

const STATUS_MAP = {
  [ProductStatus.ACTIVE]: "판매중",
  [ProductStatus.INACTIVE]: "숨김",
  [ProductStatus.SOLDOUT]: "품절",
} as const;

interface Product {
  id: number;
  name: string;
  price: number;
  discount: number;
  description: string | null;
  status: ProductStatus;
  category: string[];
  stock: number;
  options: string[];
  delivery: boolean;
  createdAt: Date;
  updatedAt: Date;
  productMainImages: string[];
  productImages: string[];
}

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(
    new Set()
  );

  const handleSelect = (id: number) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedProducts((prev) =>
      prev.size === products.length
        ? new Set()
        : new Set(products.map((p) => p.id))
    );
  };

  const handleDelete = async () => {
    try {
      const form = new FormData();
      form.append("ids", JSON.stringify(Array.from(selectedProducts)));
      const result = await deleteProducts(form);

      if (result.success) {
        toast.success(result.message, {
          duration: 3200,
        });
        setSelectedProducts(new Set());
      } else {
        toast.error("상품 삭제에 실패했습니다.", {
          description: "다시 시도해주세요.",
          duration: 3200,
        });
      }
    } catch {
      toast.error("상품 삭제에 실패했습니다.", {
        description: "다시 시도해주세요.",
        duration: 3200,
      });
    }
  };

  const handleStatusChange = async (
    productId: number,
    newStatus: ProductStatus
  ) => {
    try {
      const result = await updateProductStatus(productId, newStatus);

      if (result.success) {
        toast.success(result.message, {
          description: `상태가 ${STATUS_MAP[newStatus]}(으)로 변경되었습니다.`,
          duration: 3200,
        });
      } else {
        toast.error(result.message || "상태 변경에 실패했습니다.", {
          description: "다시 시도해주세요.",
          duration: 3200,
        });
      }
    } catch {
      toast.error("상품 상태 업데이트에 실패했습니다.", {
        description: "다시 시도해주세요.",
        duration: 3200,
      });
    }
  };

  const getStatusVariant = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.ACTIVE:
        return "default";
      case ProductStatus.INACTIVE:
        return "secondary";
      case ProductStatus.SOLDOUT:
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center">
              <Checkbox
                checked={
                  selectedProducts.size === products.length &&
                  products.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="w-[50px] text-center">No</TableHead>
            <TableHead>상품명</TableHead>
            <TableHead className="text-right">판매가</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead className="text-right">할인율</TableHead>
            <TableHead className="text-center">상태</TableHead>
            <TableHead className="text-right">재고</TableHead>
            <TableHead>등록일</TableHead>
            <TableHead>상품번호</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <TableRow key={product.id}>
              <TableCell className="text-center">
                <div className="flex size-full items-center justify-center">
                  <Checkbox
                    checked={selectedProducts.has(product.id)}
                    onCheckedChange={() => handleSelect(product.id)}
                  />
                </div>
              </TableCell>
              <TableCell className="text-center">
                {products.length - index}
              </TableCell>
              <TableCell>
                <Link
                  href={`/admin/manage-product/${product.id}`}
                  className="hover:underline"
                >
                  {product.name}
                </Link>
              </TableCell>
              <TableCell className="text-right">
                {formatPrice(product.price)}
              </TableCell>
              <TableCell>{product.category.join(", ")}</TableCell>
              <TableCell className="text-right">{product.discount}%</TableCell>
              <TableCell className="p-0 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-10 w-full items-center justify-center">
                    <Badge
                      variant={getStatusVariant(product.status)}
                      className="w-[4.5rem] cursor-pointer justify-center"
                    >
                      {STATUS_MAP[product.status]}
                      <ChevronDown className="ml-1 size-3" />
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    {Object.entries(STATUS_MAP).map(([status, label]) => (
                      <DropdownMenuItem
                        key={status}
                        className="flex min-w-[6.25rem] items-center justify-between"
                        onClick={() =>
                          handleStatusChange(
                            product.id,
                            status as ProductStatus
                          )
                        }
                      >
                        {label}
                        {product.status === status && (
                          <Check className="size-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell className="text-right">{product.stock}</TableCell>
              <TableCell>{formatDate(product.createdAt)}</TableCell>
              <TableCell>{formatProductId(product.id)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="fixed inset-x-0 bottom-0 border-t bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <Link href="/admin/manage-product/add">
            <Button>상품 추가</Button>
          </Link>
          {selectedProducts.size > 0 && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="size-4" />
              선택한 상품 삭제 ({selectedProducts.size}개)
            </Button>
          )}
        </div>
      </div>
      <div className="h-16" />
    </>
  );
}
