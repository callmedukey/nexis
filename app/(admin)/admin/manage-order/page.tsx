import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { ROUTES } from "@/constants/general";

import { OrderList } from "./_components/OrderList";
import { OrderListSkeleton } from "./_components/OrderListSkeleton";
import { StatusTabs } from "./_components/StatusTabs";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function ManageOrderPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect(ROUTES.HOME);
  }

  const awaitedSearchParams = await searchParams;
  const currentStatus = awaitedSearchParams.status || "ALL";

  return (
    <div className="space-y-4 p-6">
      <Card className="p-6">
        <div className="flex flex-col space-y-4">
          <StatusTabs currentStatus={currentStatus} />
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
