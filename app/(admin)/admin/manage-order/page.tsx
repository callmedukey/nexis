import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { ROUTES } from "@/constants/general";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

import { OrderList } from "./_components/OrderList";
import { OrderListSkeleton } from "./_components/OrderListSkeleton";

interface PageProps {
  searchParams: {
    page?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  };
}

export default async function ManageOrderPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session || !session.user.isAdmin) {
    redirect(ROUTES.HOME);
  }

  const awaitedSearchParams = await searchParams;

  return (
    <div className="space-y-4 p-6">
      <Card className="p-6">
        <div className="flex flex-col space-y-4">
          <Tabs defaultValue={awaitedSearchParams.status || "ALL"} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="ALL">전체</TabsTrigger>
              <TabsTrigger value="COMPLETED">결제완료</TabsTrigger>
              <TabsTrigger value="PENDING_DELIVERY">상품 준비중</TabsTrigger>
              <TabsTrigger value="DELIVERING">배송대기</TabsTrigger>
              <TabsTrigger value="SHIPPING">배송중</TabsTrigger>
              <TabsTrigger value="CANCELLED">취소됨</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex justify-end">
            <DatePickerWithRange />
          </div>
        </div>
      </Card>

      <Suspense fallback={<OrderListSkeleton />}>
        <OrderList searchParams={awaitedSearchParams} />
      </Suspense>
    </div>
  );
}
