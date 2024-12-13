"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { searchProducts } from "@/actions/admin";

interface Product {
  id: number;
  name: string;
  price: number;
  productMainImages: Array<{
    url: string;
  }>;
}

export function SearchBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 1000);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsSearching(true);
      setIsOpen(true);

      try {
        const response = await searchProducts(debouncedQuery);
        if (response.success && response.data) {
          setResults(response.data as Product[]);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    };

    handleSearch();
  }, [debouncedQuery]);

  // Don't show search bar in admin routes
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/explore")
  ) {
    return null;
  }

  return (
    <div className="relative mx-auto w-full max-w-screen-lg px-4 ">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primaryblack" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어 입력"
          className="w-full  rounded-full border bg-othergray py-3 pl-10 pr-4 outline-none ~text-sm/base focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isOpen && (
        <div className="absolute inset-x-4 top-full z-50 mt-2 overflow-hidden rounded-lg border bg-white shadow-lg">
          {isSearching ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              검색중...
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y">
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    router.push(`/products/${product.id}`);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-3 p-3 text-left hover:bg-gray-50"
                >
                  {product.productMainImages[0] && (
                    <Image
                      src={product.productMainImages[0].url}
                      alt={product.name}
                      className="size-12 rounded-md object-cover"
                      width={48}
                      height={48}
                    />
                  )}
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.price.toLocaleString()}원
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              검색 결과가 없습니다
            </div>
          )}
        </div>
      )}
    </div>
  );
}
