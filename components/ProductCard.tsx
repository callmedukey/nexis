"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useState } from "react";
import { toast } from "sonner";

import { addToCart } from "@/actions/cart";
import { ProductOptionsModal } from "@/components/ProductOptionsModal";
import Share from "@/public/share.svg";

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

interface ProductCardProps {
  product: Product;
  index: number;
}

const CartIcon = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
    />
  </svg>
));
CartIcon.displayName = "CartIcon";

const ProductImage = memo(
  ({ url, name, index }: { url: string; name: string; index: number }) => (
    <Image
      src={url}
      alt={name}
      fill
      sizes="(max-width: 640px) 50vw, 33vw"
      priority={index === 0}
      loading={index === 0 ? "eager" : "lazy"}
      className="object-fill will-change-transform"
      quality={75}
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
      placeholder="blur"
    />
  )
);
ProductImage.displayName = "ProductImage";

const ShareButton = memo(
  ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
    <button
      onClick={onClick}
      className="flex size-12 flex-col items-center justify-center rounded-full p-2"
    >
      <Image src={Share} alt="친구 공유" width={24} height={24} />
      <span className="text-nowrap text-xs">친구 공유</span>
    </button>
  )
);
ShareButton.displayName = "ShareButton";

function ProductCardComponent({ product, index }: ProductCardProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.options && product.options.length > 0) {
      setIsModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      const response = await addToCart({ productId: product.id, quantity: 1 });
      if (response.success) {
        toast.success(response.message || "장바구니에 추가되었습니다");
      } else {
        if (response.redirect) {
          router.push(response.redirect);
        } else {
          toast.error(response.message || "장바구니 추가에 실패했습니다");
        }
      }
    } catch {
      toast.error("장바구니 추가에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url:
            process.env.NODE_ENV === "production"
              ? process.env.NEXT_PUBLIC_URL + `/products/${product.id}`
              : "http://localhost:3000/products/" + product.id,
        });
      } else {
        await navigator.clipboard.writeText(
          process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_URL + `/products/${product.id}`
            : "http://localhost:3000/products/" + product.id
        );
        toast.success("링크가 클립보드에 복사되었습니다");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("공유에 실패했습니다");
    }
  };

  const discountedPrice = Math.round(
    product.price * (1 - product.discount / 100)
  );

  return (
    <>
      <Link href={`/products/${product.id}`} className="block" prefetch={false}>
        <div className="group overflow-hidden bg-white">
          <div className="relative aspect-square">
            {product.productMainImages?.[0] && (
              <ProductImage
                url={product.productMainImages[0].url}
                name={product.name}
                index={index}
              />
            )}
            {product.discount > 0 && (
              <div className="absolute -left-0 -top-0 flex size-8 items-center justify-center rounded-full bg-primaryred text-xs font-bold text-white sm:hidden">
                {product.discount}%
              </div>
            )}
          </div>
          <div className="space-y-2 p-2">
            <h3 className="truncate text-sm font-bold">{product.name}</h3>
            {product.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {product.description}
              </p>
            )}
            <div className="flex items-baseline gap-2">
              {product.discount > 0 && (
                <span className="hidden text-sm font-semibold text-primaryred sm:inline">
                  {product.discount}% 할인
                </span>
              )}
              <span className="text-2xl font-bold">
                <span className="text-sm tracking-[-0.15rem]">₩</span>{" "}
                {discountedPrice.toLocaleString()}
              </span>
            </div>
            <div className="!mt-4 flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={loading}
                className="flex size-12 items-center justify-center rounded-full bg-anotherblue p-2 text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="카트에 담기"
              >
                {loading ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <CartIcon />
                )}
              </button>
              <ShareButton onClick={handleShare} />
            </div>
          </div>
        </div>
      </Link>
      {isModalOpen && (
        <ProductOptionsModal
          product={product}
          onClose={() => setIsModalOpen(false)}
          onSubmit={async (optionIndex: number, quantity: number) => {
            try {
              setLoading(true);
              const response = await addToCart({
                productId: product.id,
                quantity,
                ...(product.options.length > 0 ? { optionIndex } : {}),
              });
              if (response.success) {
                toast.success(response.message || "장바구니에 추가되었습니다");
                setIsModalOpen(false);
              } else {
                toast.error(response.message || "장바구니 추가에 실패했습니다");
              }
            } catch {
              toast.error("장바구니 추가에 실패했습니다");
            } finally {
              setLoading(false);
            }
          }}
          isLoading={loading}
        />
      )}
    </>
  );
}

export const ProductCard = memo(ProductCardComponent);
