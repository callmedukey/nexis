"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BusCategory {
  id: number;
  name: string;
}

interface BusCategoryDrawerProps {
  busCategories: BusCategory[];
}

export function BusCategoryDrawer({ busCategories }: BusCategoryDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  // Get currently selected categories from URL
  const selectedCategories = new Set(
    searchParams.get("categories")?.split(",").filter(Boolean) || []
  );

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newSelectedCategories = new Set(selectedCategories);
    
    if (checked) {
      newSelectedCategories.add(categoryId);
    } else {
      newSelectedCategories.delete(categoryId);
    }

    // Create new URL with updated categories
    const params = new URLSearchParams(searchParams);
    if (newSelectedCategories.size > 0) {
      params.set("categories", Array.from(newSelectedCategories).join(","));
    } else {
      params.delete("categories");
    }

    // Update URL and trigger fetch
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="rounded-full">
          버스 종류
        </Button>
      </DrawerTrigger>
      <DrawerContent className="rounded-t-3xl">
        <DrawerTitle className="sr-only">버스 종류 선택</DrawerTitle>
        <div className="mx-auto w-full max-w-3xl p-6">
          <div className="space-y-4">
            <h4 className="text-xl font-medium">버스 종류</h4>
            
            <ScrollArea className="min-h-fit max-h-[50vh] pr-4">
              <div className="grid gap-1.5">
                {busCategories.map((category) => (
                  <div 
                    key={category.id}
                    className="group flex items-center overflow-hidden rounded-lg bg-card hover:bg-accent"
                  >
                    <div className="flex items-center space-x-2 px-4 py-2 w-full">
                      <Checkbox 
                        id={`category-${category.id}`}
                        checked={selectedCategories.has(category.id.toString())}
                        onCheckedChange={(checked) => 
                          handleCategoryChange(category.id.toString(), checked === true)
                        }
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="font-medium text-card-foreground"
                      >
                        {category.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 