import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { PaginationSkeleton } from "./_components/PaginationSkeleton";
import { ProductListSkeleton } from "./_components/ProductListSkeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-lightgray">
      <div className="flex min-w-0 flex-col gap-4 px-4 py-8 md:flex-row">
        <aside className="w-full shrink-0 md:w-60">
          <div className="bg-primaryblue px-6 py-4 text-lg text-white">
            전체 카테고리
          </div>
          <div className="bg-white px-6 py-4">
            <Accordion type="multiple" defaultValue={["item-1", "item-2"]}>
              <AccordionItem value="item-1">
                <AccordionTrigger className="gap-4">
                  <div className="w-full text-left">메인 페이지</div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-4 pl-12 [&>li]:text-base">
                    <li><Skeleton className="h-4 w-24" /></li>
                    <li><Skeleton className="h-4 w-24" /></li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="gap-4">
                  <div className="w-full text-left">카테고리별</div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-4 pl-12 [&>li]:text-base">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <li key={i}>
                        <Skeleton className="h-4 w-32" />
                        <ul className="mt-2 space-y-2 pl-4">
                          {Array.from({ length: 3 }).map((_, j) => (
                            <li key={j}>
                              <Skeleton className="h-3 w-24" />
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>

          <div className="mt-4 rounded-lg bg-white p-4 md:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">상품 관리</h1>
            </div>

            <ProductListSkeleton />
            <PaginationSkeleton />
          </div>
        </div>
      </div>
    </main>
  );
} 