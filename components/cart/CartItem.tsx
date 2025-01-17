"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { removeCartItem, updateCartItem } from "@/actions/cart";
import { Button } from "@/components/ui/button";

interface CartItemProps {
  id: string;
  quantity: number;
  selectedOption?: string | null;
  product: {
    id: number;
    name: string;
    description?: string | null;
    price: number;
    discount: number;
    productMainImages: Array<{
      url: string;
    }>;
  };
  onQuantityChange?: () => void;
}

export function CartItem({
  id,
  quantity,
  product,
  selectedOption,
  onQuantityChange,
}: CartItemProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setIsLoading(true);
      const response = await updateCartItem({
        itemId: id,
        quantity: newQuantity,
      });

      if (!response.success) {
        toast.error(response.message);
      } else {
        onQuantityChange?.();
      }
    } catch {
      toast.error("수량 변경에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsLoading(true);
      const response = await removeCartItem(id);

      if (!response.success) {
        toast.error(response.message);
      }
    } catch {
      toast.error("상품 삭제에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const originalPrice = product.price * quantity;
  const discountedPrice = Math.round(
    product.price * (1 - product.discount / 100) * quantity
  );

  return (
    <div className="flex gap-4">
      <Link
        href={`/products/${product.id}`}
        className="relative aspect-square size-24 overflow-hidden rounded-lg"
      >
        {product.productMainImages[0] && (
          <Image
            src={product.productMainImages[0].url}
            alt={product.name}
            fill
            className="object-cover"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/products/${product.id}`}>
            <h3 className="font-medium hover:underline">{product.name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground">{product.description}</p>
          {selectedOption && (
            <p className="mt-1 text-sm text-muted-foreground">
              옵션: {selectedOption}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={isLoading}
              onClick={() => handleUpdateQuantity(quantity - 1)}
              aria-label="수량 감소"
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={isLoading}
              onClick={() => handleUpdateQuantity(quantity + 1)}
              aria-label="수량 증가"
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              {product.discount > 0 && (
                <div className="text-sm text-muted-foreground line-through">
                  ₩ {originalPrice.toLocaleString()}
                </div>
              )}
              <div className={product.discount > 0 ? "font-bold" : ""}>
                ₩ {discountedPrice.toLocaleString()}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={isLoading}
              onClick={handleRemove}
              aria-label="상품 삭제"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
