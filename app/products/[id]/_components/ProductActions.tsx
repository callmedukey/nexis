"use client";

import { useState } from "react";
import { toast } from "sonner";

import { AddToCartButton } from "./AddToCartButton";
import { BuyNowButton } from "./BuyNowButton";
import { useProduct } from "./ProductContext";
import { QuantityInput } from "./QuantityInput";

interface ProductActionsProps {
  productId: number;
  stock: number;
  hasOptions: boolean;
  options: string[];
}

export function ProductActions({
  productId,
  stock,
  hasOptions,
  options,
}: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const { selectedOption } = useProduct();
  const maxQuantity = Math.min(10, stock);

  const handleAction = (action: () => void) => {
    if (hasOptions && !selectedOption) {
      toast.error("옵션을 선택해주세요");
      return;
    }
    action();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">수량</label>
          <span className="text-sm text-muted-foreground">{stock}개 남음</span>
        </div>
        <QuantityInput
          max={maxQuantity}
          value={quantity}
          onChange={setQuantity}
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <AddToCartButton
          className="order-2 w-full sm:order-1 sm:flex-1"
          productId={productId}
          quantity={quantity}
          selectedOption={selectedOption}
          options={options}
          onClick={handleAction}
        />
        <BuyNowButton
          className="order-1 w-full sm:order-2 sm:flex-1"
          productId={productId}
          quantity={quantity}
          selectedOption={selectedOption}
          options={options}
          onClick={handleAction}
        />
      </div>
    </div>
  );
}
