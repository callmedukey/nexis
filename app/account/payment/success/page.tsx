import { Card, CardContent } from "@/components/ui/card";

export default function PaymentSuccessPage() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent className="flex min-h-[300px] items-center justify-center">
          <p className="text-2xl font-semibold">결제가 완료되었습니다</p>
        </CardContent>
      </Card>
    </div>
  );
} 