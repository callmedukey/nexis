"use client";

import { ShoppingCart } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { addToCart } from "@/actions/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  className?: string;
  productId: number;
  quantity: number;
  selectedOption: string | null;
  options: string[];
  onClick: (action: () => void) => void;
}

export function AddToCartButton({
  className,
  productId,
  quantity,
  selectedOption,
  options,
  onClick,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAddToCart = () => {
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
          toast.success("장바구니에 추가되었습니다");
        } else {
          if (result.redirect) {
            router.push(result.redirect);
          } else {
            toast.error(result.message || "장바구니 추가에 실패했습니다");
          }
        }
      });
    });
  };

  return (
    <Button
      variant="outline"
      className={cn("flex items-center gap-2", className)}
      onClick={handleAddToCart}
      disabled={isPending}
    >
      <ShoppingCart className="size-4" />
      {isPending ? "추가 중..." : "장바구니"}
    </Button>
  );
}
