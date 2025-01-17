"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { addToCart } from "@/actions/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BuyNowButtonProps {
  className?: string;
  productId: number;
  quantity: number;
  selectedOption: string | null;
  options: string[];
  onClick: (action: () => void) => void;
}

export function BuyNowButton({
  className,
  productId,
  quantity,
  selectedOption,
  options,
  onClick,
}: BuyNowButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleBuyNow = () => {
    onClick(() => {
      startTransition(async () => {
        const optionIndex = selectedOption
          ? options.indexOf(selectedOption)
          : undefined;
        const result = await addToCart({
          productId,
          quantity,
          optionIndex,
        });

        if (result.success) {
          // Redirect to cart instead of checkout
          window.location.href = "/cart";
        } else {
          toast.error(result.message || "주문에 실패했습니다");
        }
      });
    });
  };

  return (
    <Button
      className={cn("flex items-center gap-2", className)}
      onClick={handleBuyNow}
      disabled={isPending}
    >
      {isPending ? "처리 중..." : "바로 구매"}
    </Button>
  );
}
