import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";

import { columns } from "./_components/columns";
import CreateCouponDialog from "./_components/create-coupon-dialog";
import { DataTable } from "./_components/data-table";

async function getCouponData() {
  const coupons = await prisma.coupon.findMany({
    include: {
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return coupons.map((coupon) => ({
    ...coupon,
    usageCount: coupon._count.orders,
  }));
}

export default async function ManageCouponsPage() {
  const coupons = await getCouponData();

  return (
    <div className="relative min-h-screen p-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">쿠폰 관리</h1>
        <p className="text-muted-foreground">쿠폰을 생성하고 관리하세요.</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <DataTable columns={columns} data={coupons} />
      </Suspense>

      <div className="fixed inset-x-0 bottom-0 border-t bg-background p-4">
        <div className="mx-auto flex items-center justify-between">
          <CreateCouponDialog />
          <Button
            variant="destructive"
            className="hidden data-[selected=true]:block"
          >
            쿠폰 삭제
          </Button>
        </div>
      </div>
    </div>
  );
}
