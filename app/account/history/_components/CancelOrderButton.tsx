"use client";

import { PurchaseStatus } from "@prisma/client";
import { toast } from "sonner";

import { cancelOrder } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { NotAllowedCancelStatus, OrderStatusKoreanMapping } from "@/constants/general";

interface CancelOrderButtonProps {
  orderId: string;
  status: PurchaseStatus;
}

export function CancelOrderButton({ orderId, status }: CancelOrderButtonProps) {
  const isNotAllowedToCancel = NotAllowedCancelStatus.includes(
    OrderStatusKoreanMapping[status]
  );

  if (isNotAllowedToCancel) {
    return null;
  }

  const handleCancel = async () => {
    const result = await cancelOrder(orderId);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleCancel}
    >
      취소 요청
    </Button>
  );
} 