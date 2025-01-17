"use client";

declare global {
  const TossPayments: ((clientKey: string) => {
    payment: (options?: { customerKey?: string }) => {
      requestPayment: (options: {
        method: string;
        amount: {
          currency: string;
          value: number;
        };
        orderId: string;
        orderName: string;
        customerName: string;
        successUrl: string;
        failUrl: string;
      }) => Promise<void>;
    };
  }) & {
    ANONYMOUS: string;
  };
}

import { useRouter } from "next/navigation";
import Script from "next/script";
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
  const [couponDiscount, setCouponDiscount] = useState(0);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Calculate final price whenever discountedTotal or couponDiscount changes
  const finalPrice = Math.max(0, discountedTotal - couponDiscount);

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

      if (!result.paymentData) {
        toast.error("결제 초기화에 실패했습니다");
        return;
      }

      try {
        console.log("Payment Data:", result.paymentData);

        // Load Toss Payments widget
        const tossPayments = TossPayments(
          process.env.NEXT_PUBLIC_TOSS_CLIENT_ID || ""
        );

        // Create payment instance with anonymous customer key
        const payment = tossPayments.payment({
          customerKey: TossPayments.ANONYMOUS,
        });

        const paymentRequest = {
          method: "CARD",
          amount: result.paymentData.amount,
          orderId: result.paymentData.orderId,
          orderName: result.paymentData.orderName,
          customerName: result.paymentData.customerName,
          successUrl: result.paymentData.successUrl,
          failUrl: result.paymentData.failUrl,
        } as const;

        console.log("Payment Request:", paymentRequest);

        // Initialize payment
        await payment.requestPayment(paymentRequest);
      } catch (error) {
        console.error("Payment request error:", error);
        toast.error("결제 요청 중 오류가 발생했습니다");
      }
    });
  };

  return (
    <>
      <Script
        src="https://js.tosspayments.com/v2/standard"
        strategy="lazyOnload"
      />
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
    </>
  );
}
