"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: number;
  name: string;
  price: number;
  discount: number;
  options: string[];
  productMainImages: Array<{
    url: string;
  }>;
}

interface ProductOptionsModalProps {
  product: Product;
  onClose: () => void;
  onSubmit: (optionIndex: number, quantity: number) => Promise<void>;
  isLoading: boolean;
}

export function ProductOptionsModal({
  product,
  onClose,
  onSubmit,
  isLoading,
}: ProductOptionsModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = async () => {
    const optionIndex = product.options.indexOf(selectedOption);
    if (optionIndex === -1) return;
    await onSubmit(optionIndex, quantity);
  };

  const discountedPrice = Math.round(
    product.price * (1 - product.discount / 100)
  );

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>상품 옵션 선택</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="flex items-center gap-4">
            {product.productMainImages?.[0] && (
              <div className="relative size-24 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={product.productMainImages[0].url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                ₩ {discountedPrice.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="option">옵션</Label>
              <Select value={selectedOption} onValueChange={setSelectedOption}>
                <SelectTrigger id="option">
                  <SelectValue placeholder="옵션을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {product.options.map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">수량</Label>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-full"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14"
                    />
                  </svg>
                </Button>
                <div className="w-16 text-center">
                  <span className="text-lg font-semibold">{quantity}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-full"
                  onClick={() => setQuantity((prev) => prev + 1)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedOption || isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              장바구니 담기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
