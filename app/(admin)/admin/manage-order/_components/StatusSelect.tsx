"use client";

import { PurchaseStatus } from "@prisma/client";
import { toast } from "sonner";

import { updateOrderStatus } from "@/actions/admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatusKoreanMapping } from "@/constants/general";

interface StatusSelectProps {
  orderId: string;
  status: PurchaseStatus;
}

export function StatusSelect({ orderId, status }: StatusSelectProps) {
  return (
    <Select
      defaultValue={status}
      onValueChange={async (value: PurchaseStatus) => {
        const result = await updateOrderStatus(orderId, value);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue>{OrderStatusKoreanMapping[status]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(OrderStatusKoreanMapping).map(([key, value]) => (
          <SelectItem key={key} value={key}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
