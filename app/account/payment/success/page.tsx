import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

import { HistoryButton } from "./_components/HistoryButton";

interface PaymentSuccessPageProps {
  searchParams: Promise<{
    orderId?: string | string[];
    paymentKey?: string;
    amount?: string;
    paymentType?: string;
  }>;
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  // Extract and handle parameters
  const params = await searchParams;

  // Handle case where orderId is an array (duplicate parameters)
  const orderId = Array.isArray(params.orderId)
    ? params.orderId[0]
    : params.orderId;

  const paymentKey = params.paymentKey;
  const amount = params.amount;

  if (!orderId) {
    redirect("/");
  }

  console.log("Success page parameters:", { orderId, paymentKey, amount });

  // Check if order already exists
  let order = await prisma.order.findFirst({
    where: {
      id: orderId,
      user: {
        providerId: session.user.id,
      },
    },
    include: {
      deliveryAddress: true,
    },
  });

  // If order doesn't exist and we have paymentKey and amount, call the payment approval API
  if (!order && paymentKey && amount) {
    try {
      console.log("Calling payment approval API with:", {
        orderId,
        paymentKey,
        amount,
      });

      // Call the TOSS payment approval API
      const response = await fetch(
        "https://api.tosspayments.com/v1/payments/confirm",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(
              process.env.TOSS_CLIENT_SECRET + ":"
            ).toString("base64")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: parseInt(amount),
          }),
        }
      );

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Payment approval failed:", errorText);

        let errorMessage = "결제 승인에 실패했습니다";
        try {
          // Try to parse error as JSON if possible
          // Only attempt to parse if the errorText is not empty and looks like JSON
          if (errorText && errorText.trim() && (errorText.trim().startsWith('{') || errorText.trim().startsWith('['))) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } else {
            console.log("Error response is not JSON format or is empty");
          }
        } catch (e) {
          // If parsing fails, use the raw text
          console.error("Failed to parse error response:", e);
        }

        return redirect(
          `/account/payment/fail?message=${encodeURIComponent(errorMessage)}`
        );
      }

      // Parse the successful response
      const responseText = await response.text();
      console.log("Raw payment approval response:", responseText);

      let paymentData;
      try {
        // Only attempt to parse if the responseText is not empty and looks like JSON
        if (responseText && responseText.trim() && (responseText.trim().startsWith('{') || responseText.trim().startsWith('['))) {
          paymentData = JSON.parse(responseText);
          console.log("Payment approval response:", paymentData);
        } else {
          console.error("Payment response is not JSON format or is empty");
          return redirect(
            `/account/payment/fail?message=${encodeURIComponent(
              "결제 응답을 처리할 수 없습니다"
            )}`
          );
        }
      } catch (e) {
        console.error("Failed to parse payment response:", e);
        return redirect(
          `/account/payment/fail?message=${encodeURIComponent(
            "결제 응답을 처리할 수 없습니다"
          )}`
        );
      }

      // Get temporary order data
      const tempOrder = await prisma.temporaryOrder.findUnique({
        where: { id: orderId },
      });

      if (!tempOrder) {
        console.error("Temporary order not found:", orderId);
        return redirect(
          `/account/payment/fail?message=${encodeURIComponent(
            "주문 정보를 찾을 수 없습니다"
          )}`
        );
      }

      const orderData = tempOrder.orderData as any;

      try {
        // Create the order with payment information
        order = await prisma.order.create({
          data: {
            id: orderId,
            user: {
              connect: {
                providerId: orderData.userId,
              },
            },
            status: "PENDING_DELIVERY",
            paymentStatus: "PAID",
            paymentMethod: paymentData.method || "CARD",
            paymentKey: paymentData.paymentKey,
            deliveryAddress: {
              create: {
                name: orderData.deliveryInfo.name,
                phone: orderData.deliveryInfo.phone,
                address: orderData.deliveryInfo.address,
                detailedAddress: orderData.deliveryInfo.detailedAddress,
                zipcode: orderData.deliveryInfo.zipcode,
              },
            },
            price: orderData.price,
            discount: orderData.discount,
            products: {
              connect: orderData.cartItems.map((item: any) => ({
                id: item.productId,
              })),
            },
            orderContent: {
              products: orderData.cartItems,
              totalAmount: orderData.price,
              originalAmount: orderData.originalTotal,
              couponDiscount: orderData.discount,
            },
          },
          include: {
            deliveryAddress: true,
          },
        });

        // Update product stock
        for (const item of orderData.cartItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Clear the cart
        await prisma.cart.update({
          where: { providerId: orderData.userId },
          data: {
            items: {
              deleteMany: {},
            },
          },
        });

        // Delete temporary order
        await prisma.temporaryOrder.delete({
          where: { id: orderId },
        });
      } catch (createError) {
        // Check if it's a unique constraint error
        if (
          typeof createError === "object" &&
          createError !== null &&
          "code" in createError &&
          createError.code === "P2002"
        ) {
          console.log(
            "Order already exists (caught in create error):",
            orderId
          );

          // Try to fetch the existing order
          order = await prisma.order.findFirst({
            where: {
              id: orderId,
              user: {
                providerId: session.user.id,
              },
            },
            include: {
              deliveryAddress: true,
            },
          });

          if (!order) {
            console.error(
              "Could not find existing order after constraint error"
            );
            return redirect(
              `/account/payment/fail?message=${encodeURIComponent(
                "주문 처리 중 오류가 발생했습니다"
              )}`
            );
          }
        } else {
          console.error("Error creating order:", createError);
          return redirect(
            `/account/payment/fail?message=${encodeURIComponent(
              "주문 처리 중 오류가 발생했습니다"
            )}`
          );
        }
      }
    } catch (error) {
      console.error("Error in payment process:", error);
      return redirect(
        `/account/payment/fail?message=${encodeURIComponent(
          "결제 처리 중 오류가 발생했습니다"
        )}`
      );
    }
  }

  if (!order) {
    redirect("/");
  }

  const orderContent = order.orderContent as any;

  return (
    <div className="container mx-auto min-h-screen space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>결제가 완료되었습니다</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-semibold">주문 정보</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">주문 번호</span>
                <span>{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">결제 금액</span>
                <span>{formatPrice(order.price)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-semibold">배송 정보</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">받는 분</span>
                <span>{order.deliveryAddress?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">연락처</span>
                <span>{order.deliveryAddress?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">주소</span>
                <span>
                  {order.deliveryAddress?.address}{" "}
                  {order.deliveryAddress?.detailedAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">우편번호</span>
                <span>{order.deliveryAddress?.zipcode}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-semibold">주문 상품</h3>
            <div className="space-y-2">
              {orderContent.products.map((product: any) => (
                <div key={product.productId} className="flex justify-between">
                  <span>
                    {product.productName}{" "}
                    {product.selectedOption && `(${product.selectedOption})`} x{" "}
                    {product.quantity}
                  </span>
                  <span>{formatPrice(product.subTotalPrice)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <HistoryButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
