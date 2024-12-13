"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { validateCoupon } from "@/actions/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CouponFormProps {
  discountedTotal: number;
  onValidCoupon: (discount: number) => void;
}

export function CouponForm({ discountedTotal, onValidCoupon }: CouponFormProps) {
  const [isPending, startTransition] = useTransition();
  const [couponCode, setCouponCode] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!couponCode) return;

    startTransition(async () => {
      const result = await validateCoupon(couponCode);
      
      if (result.success && result.data) {
        setIsValid(true);
        const { flatDiscount, discountRate } = result.data;
        
        let newDiscount = 0;
        if (flatDiscount) {
          newDiscount = flatDiscount;
        } else if (discountRate) {
          newDiscount = Math.round(discountedTotal * (discountRate / 100));
        }
        
        setAppliedDiscount(newDiscount);
        onValidCoupon(newDiscount);
        toast.success(result.message);
      } else {
        setIsValid(false);
        setAppliedDiscount(0);
        onValidCoupon(0);
        toast.error(result.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="쿠폰 코드 입력"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          disabled={isValid || isPending}
        />
        <Button
          type="submit"
          variant={isValid ? "outline" : "default"}
          disabled={isValid || isPending || !couponCode}
        >
          {isValid ? "적용됨" : "적용"}
        </Button>
      </div>
      {isValid && appliedDiscount > 0 && (
        <div className="flex justify-between font-medium">
          <span>쿠폰 할인</span>
          <span>- ₩ {appliedDiscount.toLocaleString()}</span>
        </div>
      )}
    </form>
  );
} 