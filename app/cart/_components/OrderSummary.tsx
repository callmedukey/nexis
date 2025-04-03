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
  const [paymentData, setPaymentData] = useState<any>(null);

  // Calculate final price whenever discountedTotal or couponDiscount changes
  const finalPrice = Math.max(0, discountedTotal - couponDiscount);

  // Initialize payment widgets when showing payment methods
  useEffect(() => {
    if (showPaymentMethods && paymentMethodRef.current && !paymentWidgets) {
      const initializePaymentWidgets = async () => {
        try {
          console.log("Initializing payment widgets with client ID:", process.env.NEXT_PUBLIC_TOSS_CLIENT_ID);
          console.log("Final price:", finalPrice);
          
          // Load Toss Payments with the API individual integration key
          const tossPayments = await loadTossPayments(
            process.env.NEXT_PUBLIC_TOSS_CLIENT_ID || ""
          );

          // Initialize the widgets module with anonymous customer key
          const widgets = tossPayments.widgets({
            customerKey: ANONYMOUS,
          });

          // Set the payment amount - this is crucial for the payment to work
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
      setPaymentData(result.paymentData);
    });
  };

  const handlePayment = async () => {
    if (!paymentWidgets || !paymentMethodWidget) {
      toast.error("결제 위젯이 초기화되지 않았습니다");
      return;
    }

    if (!paymentData) {
      toast.error("결제 정보가 초기화되지 않았습니다");
      return;
    }

    try {
      // Get the selected payment method
      const selectedMethod = paymentMethodWidget.getSelectedPaymentMethod();
      if (!selectedMethod) {
        toast.error("결제 수단을 선택해주세요");
        return;
      }

      console.log("Selected payment method:", selectedMethod);

      // Prepare payment request with all required parameters
      const paymentRequest = {
        orderId: paymentData.orderId,
        orderName: paymentData.orderName,
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        customerMobilePhone: paymentData.customerMobilePhone,
        successUrl: paymentData.successUrl,
        failUrl: paymentData.failUrl,
      };

      console.log("Payment request:", paymentRequest);
      
      // Show loading toast
      const loadingToast = toast.loading("결제를 처리 중입니다...");
      
      // Request payment using the widgets module
      await paymentWidgets.requestPayment(paymentRequest);
      
      // Note: We won't reach this point if the payment is successful
      // as the browser will be redirected to the successUrl or failUrl
      toast.dismiss(loadingToast);
    } catch (error) {
      // Log the error for debugging
      console.error("Payment error:", error);
      
      // Show error message to user
      if (error && typeof error === 'object' && 'message' in error) {
        toast.error(`결제 오류: ${(error as any).message}`);
      } else {
        toast.error("결제 요청 중 오류가 발생했습니다");
      }
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
