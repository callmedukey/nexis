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

interface Event {
  id: number;
  title: string;
  content: string | null;
  active: boolean;
  thumbnail: Array<{
    url: string;
  }>;
}

interface EventCarouselProps {
  events: Event[];
}

export function EventCarousel({ events }: EventCarouselProps) {
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

  const activeEvents = events.filter((event) => event.active);

  if (activeEvents.length === 0) {
    return null;
  }

  return (
    <div className="relative mx-auto w-full max-w-screen-lg">
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
          {activeEvents.map((event) => (
            <CarouselItem key={event.id}>
              <Link href={`/events/${event.id}`}>
                <div className="relative aspect-[21/9] w-full overflow-hidden ~min-h-[12.5rem]/[25rem]">
                  {event.thumbnail[0] && (
                    <Image
                      src={event.thumbnail[0].url}
                      alt={event.title}
                      fill
                      className="object-fill"
                      priority
                    />
                  )}
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" /> */}
      </Carousel>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1">
        {activeEvents.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              index === current ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
