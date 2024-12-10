"use client";

import { PurchaseStatus } from "@prisma/client";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { useDebounce } from "@/app/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<PurchaseStatus, string> = {
  PENDING: "결제대기",
  PENDING_DELIVERY: "배송준비",
  DELIVERING: "배송중",
  COMPLETED: "배송완료",
  CANCELLED: "주문취소",
};

export function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams?.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams?.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined
  );

  const currentStatus = searchParams?.get("status") as PurchaseStatus | null;

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  const debouncedCallback = useDebounce((value: string, type: string) => {
    router.push(
      `${pathname}?${createQueryString({
        [type]: value || null,
        page: null,
      })}`
    );
  }, 300);

  const handleDateSelect = (date: Date | undefined, type: "start" | "end") => {
    if (type === "start") {
      setStartDate(date);
      router.push(
        `${pathname}?${createQueryString({
          startDate: date ? date.toISOString().split("T")[0] : null,
          page: null,
        })}`
      );
    } else {
      setEndDate(date);
      router.push(
        `${pathname}?${createQueryString({
          endDate: date ? date.toISOString().split("T")[0] : null,
          page: null,
        })}`
      );
    }
  };

  const handleStatusChange = (status: PurchaseStatus | null) => {
    router.push(
      `${pathname}?${createQueryString({
        status: status || null,
        page: null,
      })}`
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">시작일</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 size-4" />
                {startDate ? (
                  startDate.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                ) : (
                  <span>시작일 선택</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                locale={ko}
                selected={startDate}
                onSelect={(date) => handleDateSelect(date, "start")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">종료일</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 size-4" />
                {endDate ? (
                  endDate.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                ) : (
                  <span>종료일 선택</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                locale={ko}
                selected={endDate}
                onSelect={(date) => handleDateSelect(date, "end")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">구매자명</label>
          <Input
            placeholder="구매자명으로 검색"
            defaultValue={searchParams?.get("buyerName") || ""}
            onChange={(e) => debouncedCallback(e.target.value, "buyerName")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">상품명</label>
          <Input
            placeholder="상품명으로 검색"
            defaultValue={searchParams?.get("productName") || ""}
            onChange={(e) => debouncedCallback(e.target.value, "productName")}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={currentStatus === null ? "default" : "outline"}
          onClick={() => handleStatusChange(null)}
        >
          전체
        </Button>
        {Object.entries(STATUS_MAP).map(([status, label]) => (
          <Button
            key={status}
            variant={currentStatus === status ? "default" : "outline"}
            onClick={() => handleStatusChange(status as PurchaseStatus)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
