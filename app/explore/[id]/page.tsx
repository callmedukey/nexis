import Image from "next/image";
import { notFound } from "next/navigation";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import prisma from "@/lib/prisma";

import { ShareButton } from "./_components/ShareButton";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function PostPage({ params }: Props) {
  const awaitedParams = await params;
  const post = await prisma.post.findUnique({
    where: {
      id: parseInt(awaitedParams.id),
    },
    include: {
      thumbnail: true,
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-screen-lg px-4 py-8">
      <h1 className="text-2xl font-bold">{post.title}</h1>

      {post.thumbnail.length > 0 && (
        <div className="relative mx-auto mt-8 w-full">
          <Carousel
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {post.thumbnail.map((image) => (
                <CarouselItem key={image.id} className="basis-full">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    <Image
                      src={image.url}
                      alt={post.title}
                      fill
                      className="object-fill"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-1">
            {post.thumbnail.map((_, index) => (
              <div
                key={index}
                className="size-1.5 rounded-full bg-primary/50"
              />
            ))}
          </div>
        </div>
      )}

      <div
        className="prose mt-12 !max-w-full whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="flex justify-center ~mt-12/24">
        <ShareButton />
      </div>
    </main>
  );
}
