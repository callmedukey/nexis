"use client";

import { addDays, format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DateRangePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [date, setDate] = React.useState<{
    from?: Date;
    to?: Date;
  }>({
    from: searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined,
    to: searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined,
  });

  const handleSelect = (value: { from?: Date; to?: Date }) => {
    setDate(value);
    
    const params = new URLSearchParams(searchParams);
    if (value.from) {
      params.set("from", value.from.toISOString());
    } else {
      params.delete("from");
    }
    if (value.to) {
      params.set("to", value.to.toISOString());
    } else {
      params.delete("to");
    }
    params.delete("page");
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "yyyy년 MM월 dd일", { locale: ko })} -{" "}
                  {format(date.to, "yyyy년 MM월 dd일", { locale: ko })}
                </>
              ) : (
                format(date.from, "yyyy년 MM월 dd일", { locale: ko })
              )
            ) : (
              <span>날짜 선택</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={ko}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
} 