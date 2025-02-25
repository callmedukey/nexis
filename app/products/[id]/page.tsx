import { ProductStatus } from "@prisma/client";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import prisma from "@/lib/prisma";
import SpecialDelivery from "@/public/delivery_notice.webp";

import { OptionsSelect } from "./_components/OptionsSelect";
import { ProductActions } from "./_components/ProductActions";
import { ProductProvider } from "./_components/ProductContext";
import { ShareButton } from "./_components/ShareButton";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: Props) {
  const awaitedParams = await params;
  const product = await prisma.product.findUnique({
    where: {
      id: parseInt(awaitedParams.id),
      status: ProductStatus.ACTIVE,
    },
    include: {
      productMainImages: {
        orderBy: {
          order: "asc",
        },
      },
      productImages: {
        orderBy: {
          order: "asc",
        },
      },
      category: true,
      subCategory: true,
    },
  });

  if (!product) {
    notFound();
  }

  const discountedPrice = product.price * (1 - product.discount / 100);

  return (
    <div className="mx-auto flex max-w-screen-sm flex-col px-4 sm:px-0">
      {/* Main Image Carousel - Full Width */}
      <div className="w-full">
        <div className="relative aspect-[16/9] w-full">
          <Carousel className="size-full" opts={{ loop: true }}>
            <CarouselContent>
              {product.productMainImages.map((image, index) => (
                <CarouselItem key={image.id}>
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={image.url}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-contain"
                      priority={index === 0}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {product.productMainImages.map((_, index) => (
                <div
                  key={index}
                  className="size-2 rounded-full bg-foreground/50"
                />
              ))}
            </div>
          </Carousel>
        </div>
      </div>

      {/* Product Info and Details */}
      <div className="py-10">
        <div className="grid gap-8">
          {/* Product Info */}
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{product.description}</p>

            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  ₩{Math.round(discountedPrice).toLocaleString()}
                </span>
                {product.discount > 0 && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₩{Math.round(product.price).toLocaleString()}
                  </span>
                )}
              </div>
              {product.discount > 0 && (
                <span className="text-lg font-semibold text-primaryred">
                  {product.discount}% 할인
                </span>
              )}
              <div className="hidden sm:ml-auto sm:block">
                <ShareButton />
              </div>
            </div>

            <div className="block sm:hidden">
              <ShareButton />
            </div>

            <ProductProvider>
              {product.options.length > 0 && (
                <OptionsSelect options={product.options} />
              )}

              <ProductActions
                productId={product.id}
                stock={product.stock}
                hasOptions={product.options.length > 0}
                options={product.options}
              />
            </ProductProvider>
          </div>

          {/* Additional Info or Features can go here */}
          <div className="space-y-4">
            {/* Add any additional product information here */}
          </div>
        </div>

        {/* Detail Images */}
        <div className="mt-16 space-y-4">
          {product.productImages.map((image, index) => (
            <div key={image.id} className="relative w-full overflow-hidden">
              <Image
                src={image.url}
                alt={`${product.name} - Detail ${index + 1}`}
                width={768}
                height={0}
                className="h-auto w-full"
                unoptimized
              />
            </div>
          ))}
          {product?.specialDelivery && (
            <div className="relative w-full overflow-hidden">
              <Image
                src={SpecialDelivery}
                alt={`${product.name} - 특별 배송 안내`}
                className="h-auto w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
