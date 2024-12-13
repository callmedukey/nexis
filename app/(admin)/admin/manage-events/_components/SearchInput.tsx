"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("query")?.toString() || "");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearchTerm) {
      params.set("query", debouncedSearchTerm);
    } else {
      params.delete("query");
    }
    params.delete("page"); // Reset page when searching
    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearchTerm, pathname, router, searchParams]);

  return (
    <Input
      placeholder="이벤트 검색..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="max-w-[250px]"
    />
  );
} 