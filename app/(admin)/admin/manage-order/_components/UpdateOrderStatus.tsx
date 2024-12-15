"use client";

import { PurchaseStatus } from "@prisma/client";
import { useTransition } from "react";
import { toast } from "sonner";

import { updateOrderStatus } from "@/actions/order";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatusKoreanMapping } from "@/constants/general";

interface UpdateOrderStatusProps {
  orderId: string;
  currentStatus: PurchaseStatus;
}

export function UpdateOrderStatus({
  orderId,
  currentStatus,
}: UpdateOrderStatusProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: PurchaseStatus) => {
    if (newStatus === currentStatus) return;

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("주문 상태가 업데이트되었습니다");
    });
  };

  return (
    <Select
      defaultValue={currentStatus}
      onValueChange={handleStatusChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(OrderStatusKoreanMapping).map(([status, label]) => (
          <SelectItem key={status} value={status}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
