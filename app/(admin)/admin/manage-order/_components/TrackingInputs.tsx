"use client";

import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface TrackingInputsProps {
  orderId: string;
  initialTrackingCompany: string | null;
  initialTrackingNumber: string | null;
}

export function TrackingInputs({
  orderId,
  initialTrackingCompany,
  initialTrackingNumber,
}: TrackingInputsProps) {
  const handleTrackingUpdate = async (
    type: "company" | "number",
    value: string
  ) => {
    try {
      const response = await fetch("/api/orders/tracking", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          ...(type === "company"
            ? { trackingCompany: value }
            : { trackingNumber: value }),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      toast.success(
        type === "company"
          ? "배송업체가 업데이트되었습니다"
          : "운송장번호가 업데이트되었습니다"
      );
    } catch (error) {
      toast.error(
        type === "company"
          ? "배송업체 업데이트에 실패했습니다"
          : "운송장번호 업데이트에 실패했습니다"
      );
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Input
        defaultValue={initialTrackingCompany || ""}
        placeholder="배송업체명"
        className="h-7 text-sm"
        onBlur={(e) => handleTrackingUpdate("company", e.target.value)}
      />
      <Input
        defaultValue={initialTrackingNumber || ""}
        placeholder="운송장번호"
        className="h-7 text-sm"
        onBlur={(e) => handleTrackingUpdate("number", e.target.value)}
      />
    </div>
  );
} 