import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { ROUTES } from "@/constants/general";

import { OrderList } from "./_components/OrderList";
import { OrderListSkeleton } from "./_components/OrderListSkeleton";
import { SearchFilters } from "./_components/SearchFilters";

interface PageProps {
  searchParams: {
    page?: string;
    startDate?: string;
    endDate?: string;
    buyerName?: string;
    productName?: string;
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">주문 관리</h1>
      </div>
      <SearchFilters />
      <Suspense fallback={<OrderListSkeleton />}>
        <OrderList searchParams={awaitedSearchParams} />
      </Suspense>
    </div>
  );
}
