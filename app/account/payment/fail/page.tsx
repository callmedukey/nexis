import { Card, CardContent } from "@/components/ui/card";

interface PaymentFailPageProps {
  searchParams: Promise<{
    orderId?: string;
    message?: string;
  }>;
}

export default async function PaymentFailPage({
  searchParams,
}: PaymentFailPageProps) {
  const { message = "결제에 실패했습니다" } = await searchParams;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-4">
          <p className="text-2xl font-semibold text-destructive">결제 실패</p>
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
