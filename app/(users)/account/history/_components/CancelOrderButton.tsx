"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { cancelOrder } from "@/actions/user";
import { Button } from "@/components/ui/button";

interface CancelOrderButtonProps {
  orderId: string;
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (
      !confirm(
        "주문을 취소하시겠습니까? 취소 후에는 되돌릴 수 없습니다."
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await cancelOrder(orderId);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleCancel}
      disabled={isPending}
    >
      취소 요청
    </Button>
  );
} 