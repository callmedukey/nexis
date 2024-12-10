"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useDebounce } from "@/app/hooks/use-debounce";
import { Input } from "@/components/ui/input";

export function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString());

    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    }

    return newSearchParams.toString();
  };

  const debouncedCallback = useDebounce((value: string, type: string) => {
    router.push(
      `${pathname}?${createQueryString({
        [type]: value || null,
        page: null,
      })}`
    );
  }, 300);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-2">
        <label className="text-sm font-medium">이메일</label>
        <Input
          placeholder="이메일로 검색"
          defaultValue={searchParams?.get("email") || ""}
          onChange={(e) => debouncedCallback(e.target.value, "email")}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">전화번호</label>
        <Input
          placeholder="전화번호로 검색"
          defaultValue={searchParams?.get("phone") || ""}
          onChange={(e) => debouncedCallback(e.target.value, "phone")}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">이름</label>
        <Input
          placeholder="이름으로 검색"
          defaultValue={searchParams?.get("name") || ""}
          onChange={(e) => debouncedCallback(e.target.value, "name")}
        />
      </div>
    </div>
  );
} 