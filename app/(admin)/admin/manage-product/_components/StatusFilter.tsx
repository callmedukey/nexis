"use client";

import { ProductStatus } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

interface StatusFilterProps {
  counts: {
    total: number;
    active: number;
    soldout: number;
    inactive: number;
  };
}

export function StatusFilter({ counts }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status");

  const handleStatusChange = (status: ProductStatus | "all") => {
    const params = new URLSearchParams(searchParams);
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    params.delete("page");
    router.push(`/admin/manage-product?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => handleStatusChange("all")}
        className={cn(
          "flex items-center gap-2 rounded-lg bg-white px-4 py-2 transition-colors hover:bg-gray-50",
          !currentStatus && "bg-black text-white hover:bg-black/90"
        )}
      >
        <span>전체</span>
        <div className="grid size-5 place-items-center rounded-full bg-red-500 text-xs leading-none text-white">
          {counts.total}
        </div>
      </button>
      <button
        onClick={() => handleStatusChange(ProductStatus.ACTIVE)}
        className={cn(
          "flex items-center gap-2 rounded-lg bg-white px-4 py-2 transition-colors hover:bg-gray-50",
          currentStatus === ProductStatus.ACTIVE && "bg-black text-white hover:bg-black/90"
        )}
      >
        <span>판매중</span>
        <div className="grid size-5 place-items-center rounded-full bg-red-500 text-xs leading-none text-white">
          {counts.active}
        </div>
      </button>
      <button
        onClick={() => handleStatusChange(ProductStatus.SOLDOUT)}
        className={cn(
          "flex items-center gap-2 rounded-lg bg-white px-4 py-2 transition-colors hover:bg-gray-50",
          currentStatus === ProductStatus.SOLDOUT && "bg-black text-white hover:bg-black/90"
        )}
      >
        <span>품절</span>
        <div className="grid size-5 place-items-center rounded-full bg-red-500 text-xs leading-none text-white">
          {counts.soldout}
        </div>
      </button>
      <button
        onClick={() => handleStatusChange(ProductStatus.INACTIVE)}
        className={cn(
          "flex items-center gap-2 rounded-lg bg-white px-4 py-2 transition-colors hover:bg-gray-50",
          currentStatus === ProductStatus.INACTIVE && "bg-black text-white hover:bg-black/90"
        )}
      >
        <span>숨김</span>
        <div className="grid size-5 place-items-center rounded-full bg-red-500 text-xs leading-none text-white">
          {counts.inactive}
        </div>
      </button>
    </div>
  );
} 