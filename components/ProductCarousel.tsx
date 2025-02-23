"use client";

import Autoplay from "embla-carousel-autoplay";
import { useEffect, useMemo, useState } from "react";

import { ProductCard } from "@/components/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  discount: number;
  options: string[];
  productMainImages: Array<{
    url: string;
  }>;
}

interface ProductCarouselProps {
  products: Product[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const plugin = useMemo(
    () =>
      Autoplay({
        delay: 5000,
        stopOnInteraction: true,
        rootNode: (emblaRoot) => emblaRoot.parentElement,
      }),
    []
  );

  const carouselOptions = useMemo(
    () => ({
      align: "start" as const,
      loop: true,
      skipSnaps: false,
      dragFree: false,
      containScroll: "trimSnaps" as const,
      watchDrag: true,
      duration: 25,
    }),
    []
  );

  if (products.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
        등록된 제품이 없습니다
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full ~mt-4/8">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={carouselOptions}
        plugins={[plugin]}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product, index) => (
            <CarouselItem
              key={product.id}
              className="basis-1/2 pl-2 sm:basis-1/3 md:pl-4"
            >
              <ProductCard product={product} index={index} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-1">
        {products.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              index === current ? "w-6 bg-primary" : "w-1.5 bg-primary/50"
            }`}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
