"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { useDebounce } from "@/app/hooks/use-debounce";
import { Input } from "@/components/ui/input";

export function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const createQueryString = useDebounce((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, 500);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
      <Input
        placeholder="제목 또는 내용으로 검색"
        defaultValue={searchParams.get("query") ?? ""}
        onChange={(e) => createQueryString(e.target.value)}
        className="pl-8"
      />
    </div>
  );
}
