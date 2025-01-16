"use client";
import type { Category, Product } from "@prisma/client";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { deleteProducts } from "@/actions/admin";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generateProductId } from "@/lib/generateProductId";

const ManageProductScreenTab = ({
  products,
}: {
  products: (Product & { category: Category[] })[];
}) => {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const handleDelete = async (
    type: "all" | "selected",
    productIds?: number[]
  ) => {
    if (type === "all") {
      const response = await deleteProducts(
        productIds ?? products.map((product) => product.id)
      );

      if (response?.success) {
        toast.success("상품을 삭제하였습니다.");
      } else {
        toast.error(response?.message ?? "상품 삭제에 실패하였습니다.");
      }
    }

    if (type === "selected" && productIds) {
      const response = await deleteProducts(productIds);

      if (response?.success) {
        toast.success("상품을 삭제하였습니다.");
      } else {
        toast.error(response?.message ?? "상품 삭제에 실패하였습니다.");
      }
    }
  };
  return (
    <div className="min-h-[25rem] w-full bg-white">
      <Table>
        <TableHeader className="bg-white">
          <TableRow className="">
            <TableHead className="">
              <span className="flex items-center gap-2">
                <Checkbox
                  checked={
                    selectedProducts.length === products.length &&
                    products.length !== 0
                  }
                  onCheckedChange={(checked) =>
                    setSelectedProducts(
                      checked ? products.map((product) => product.id) : []
                    )
                  }
                />
                No.
              </span>
            </TableHead>
            <TableHead>상품명</TableHead>
            <TableHead>판매가</TableHead>
            <TableHead className="">카테고리</TableHead>
            <TableHead className="">할인율</TableHead>
            <TableHead className="">상태</TableHead>
            <TableHead className="">재고</TableHead>
            <TableHead className="">등록일</TableHead>
            <TableHead className="">상품 번호</TableHead>
            <TableHead className=""></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="">
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-icongray">
                상품이 없습니다.
              </TableCell>
            </TableRow>
          ) : null}
          {products.map((product, index) => (
            <TableRow key={product.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.price}</TableCell>
              <TableCell>{product.category[0]?.name ?? "-"}</TableCell>
              <TableCell>{product.discount}</TableCell>
              <TableCell>{product.status}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.createdAt.toLocaleDateString()}</TableCell>
              <TableCell>{generateProductId(product.id)}</TableCell>
              {selectedProducts.includes(product.id) ? (
                <TableCell>
                  <button
                    className="flex items-center gap-2"
                    onClick={() => handleDelete("selected", [product.id])}
                  >
                    <Trash2 className="size-5 cursor-pointer transition-colors duration-300 hover:text-red-500" />
                  </button>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ManageProductScreenTab;
