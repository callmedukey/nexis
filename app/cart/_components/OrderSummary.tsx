"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { submitOrder } from "@/actions/order";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

import { CouponForm } from "./CouponForm";
import { DeliveryForm } from "./DeliveryForm";

interface OrderSummaryProps {
  originalTotal: number;
  discountedTotal: number;
  totalDiscount: number;
  userData?: {
    name?: string | null;
    phone?: string | null;
    address?: string | null;
    detailedAddress?: string | null;
    zipcode?: string | null;
  };
}

export function OrderSummary({
  originalTotal,
  discountedTotal,
  totalDiscount,
  userData,
}: OrderSummaryProps) {
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [finalPrice, setFinalPrice] = useState(discountedTotal);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDeliverySubmit = async (data: {
    deliveryInfo: {
      name: string;
      phone: string;
      address: string;
      detailedAddress: string;
      zipcode: string;
      setAsDefault: boolean;
    };
  }) => {
    startTransition(async () => {
      const result = await submitOrder({
        couponDiscount,
        deliveryInfo: data.deliveryInfo,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("주문이 완료되었습니다");
      router.push(`/account/payment/success?orderId=${result.orderId}`);
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>주문 요약</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">상품 금액</span>
            <span>{formatPrice(originalTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">할인 금액</span>
            <span>-{formatPrice(totalDiscount)}</span>
          </div>
          <CouponForm
            discountedTotal={discountedTotal}
            onValidCoupon={(discount) => {
              setCouponDiscount(discount);
              setFinalPrice(discountedTotal - discount);
            }}
          />
          <Separator />
          <div className="flex justify-between font-bold">
            <span>총 결제 금액</span>
            <span>{formatPrice(finalPrice)}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            onClick={() => setShowDeliveryForm(true)}
            disabled={showDeliveryForm || isPending}
          >
            {isPending ? "주문 처리중..." : "배송지 입력"}
          </Button>
        </CardFooter>
      </Card>

      {showDeliveryForm && (
        <DeliveryForm
          defaultValues={userData}
          couponDiscount={couponDiscount}
          onSubmit={handleDeliverySubmit}
        />
      )}
    </div>
  );
}
