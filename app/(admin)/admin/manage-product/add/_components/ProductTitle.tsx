"use client";

import { useContext } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Context } from "../_providers/ContextProvider";

const ProductTitle = () => {
  const [context, setContext] = useContext(Context);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="name">상품 명</Label>
          <Input
            id="name"
            value={context.name ?? ""}
            onChange={(e) => setContext({ ...context, name: e.target.value })}
            placeholder="상품 명을 입력해주세요"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="description">상품 설명</Label>
          <Input
            id="description"
            value={context.description ?? ""}
            onChange={(e) =>
              setContext({ ...context, description: e.target.value })
            }
            placeholder="상품 설명을 입력해주세요"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-48 space-y-2">
          <Label htmlFor="productId">상품 번호</Label>
          <Input
            id="productId"
            disabled
            placeholder="자동 생성"
            className="bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductTitle;
