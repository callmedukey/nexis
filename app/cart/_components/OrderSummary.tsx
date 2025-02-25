"use client";

import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useState, useTransition, useRef, useEffect } from "react";
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
  const [isPending, startTransition] = useTransition();
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  const [paymentWidgets, setPaymentWidgets] = useState<any>(null);
  const [paymentMethodWidget, setPaymentMethodWidget] = useState<any>(null);

  // Calculate final price whenever discountedTotal or couponDiscount changes
  const finalPrice = Math.max(0, discountedTotal - couponDiscount);

  // Initialize payment widgets when showing payment methods
  useEffect(() => {
    if (showPaymentMethods && paymentMethodRef.current && !paymentWidgets) {
      const initializePaymentWidgets = async () => {
        try {
          // Load Toss Payments with the API individual integration key
          const tossPayments = await loadTossPayments(
            process.env.NEXT_PUBLIC_TOSS_CLIENT_ID || ""
          );

          // Initialize the widgets module with anonymous customer key
          const widgets = tossPayments.widgets({
            customerKey: ANONYMOUS,
          });

          // Set the payment amount
          widgets.setAmount({
            value: finalPrice,
            currency: "KRW",
          });

          setPaymentWidgets(widgets);

          // Render payment methods
          const methodWidget = await widgets.renderPaymentMethods({
            selector: "#payment-method",
            variantKey: "DEFAULT",
          });

          setPaymentMethodWidget(methodWidget);
        } catch (error) {
          console.error("Payment widget initialization error:", error);
          toast.error("결제 위젯 초기화에 실패했습니다");
        }
      };

      initializePaymentWidgets();
    }
  }, [showPaymentMethods, finalPrice, paymentWidgets]);

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

      // Show payment methods after successful order submission
      setShowPaymentMethods(true);
    });
  };

  const handlePayment = async () => {
    if (!paymentWidgets || !paymentMethodWidget) {
      toast.error("결제 위젯이 초기화되지 않았습니다");
      return;
    }

    try {
      // Get the selected payment method
      const selectedMethod = paymentMethodWidget.getSelectedPaymentMethod();
      if (!selectedMethod) {
        toast.error("결제 수단을 선택해주세요");
        return;
      }

      // Prepare payment request with the correct structure
      const paymentRequest = {
        orderId: `order-${Date.now()}`,
        orderName: "상품 주문",
        customerName: userData?.name || "고객",
        successUrl: `${window.location.origin}/api/payments/success`,
        failUrl: `${window.location.origin}/api/payments/fail`,
        // method parameter is not supported in this context
      };

      // Request payment using the widgets module
      await paymentWidgets.requestPayment(paymentRequest);
    } catch (error) {
      console.error("Payment request error:", error);
      toast.error("결제 요청 중 오류가 발생했습니다");
    }
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
            }}
          />
          <Separator />
          <div className="flex justify-between font-bold">
            <span>총 결제 금액</span>
            <span>{formatPrice(finalPrice)}</span>
          </div>
        </CardContent>
        <CardFooter>
          {!showDeliveryForm && !showPaymentMethods && (
            <Button
              className="w-full"
              size="lg"
              onClick={() => setShowDeliveryForm(true)}
              disabled={isPending}
            >
              {isPending ? "주문 처리중..." : "배송지 입력"}
            </Button>
          )}
        </CardFooter>
      </Card>

      {showDeliveryForm && !showPaymentMethods && (
        <DeliveryForm
          defaultValues={userData}
          couponDiscount={couponDiscount}
          onSubmit={handleDeliverySubmit}
        />
      )}

      {showPaymentMethods && (
        <Card>
          <CardHeader>
            <CardTitle>결제 수단 선택</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Payment method widget will be rendered here */}
            <div
              id="payment-method"
              ref={paymentMethodRef}
              className="mb-4"
            ></div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              onClick={handlePayment}
              disabled={isPending || !paymentMethodWidget}
            >
              {isPending ? "결제 처리중..." : "결제하기"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
