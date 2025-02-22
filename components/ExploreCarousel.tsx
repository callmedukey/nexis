"use client";

import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ROUTES } from "@/constants/general";

interface ExploreItem {
  id: number;
  title: string;
  thumbnail: string;
}

interface ExploreCarouselProps {
  items: ExploreItem[];
}

export function ExploreCarousel({ items }: ExploreCarouselProps) {
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

  if (items.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
        등록된 둘러보기가 없습니다
      </div>
    );
  }

  return (
    <div className="relative mx-auto mt-4 w-full">
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
          {items.map((item) => (
            <CarouselItem key={item.id} className="basis-1/2 sm:basis-1/3">
              <Link
                href={`${ROUTES.EXPLORE}/${item.id}`}
                className="group block overflow-hidden rounded-lg"
              >
                <div className="relative aspect-square w-full overflow-hidden">
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    placeholder="blur"
                    blurDataURL={item.thumbnail.replace(".webp", "ph.webp")}
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 line-clamp-2 px-1 text-left font-bold ~text-sm/base">
                  {item.title}
                </h3>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 gap-1">
        {items.map((_, index) => (
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
