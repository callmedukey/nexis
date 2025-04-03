import { Card, CardContent } from "@/components/ui/card";

interface PaymentFailPageProps {
  searchParams: Promise<{
    orderId?: string | string[];
    message?: string;
    code?: string;
  }>;
}

export default async function PaymentFailPage({
  searchParams,
}: PaymentFailPageProps) {
  // Extract parameters
  const params = await searchParams;

  // Handle case where orderId is an array (duplicate parameters)
  const orderId = Array.isArray(params.orderId)
    ? params.orderId[0]
    : params.orderId;

  const message = params.message || "결제에 실패했습니다";
  const code = params.code;

  console.log("Fail page parameters:", { orderId, message, code });

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-4">
          <p className="text-2xl font-semibold text-destructive">결제 실패</p>
          <p className="text-muted-foreground">{message}</p>
          {orderId && (
            <p className="text-sm text-muted-foreground">주문번호: {orderId}</p>
          )}
          {code && (
            <p className="text-sm text-muted-foreground">오류 코드: {code}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
