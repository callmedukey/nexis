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
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const plugin = useMemo(
    () =>
      Autoplay({
        delay: 5000,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
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
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[plugin]}
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem key={product.id} className="basis-1/2 sm:basis-1/3">
              <ProductCard product={product} />
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
