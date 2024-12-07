"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { toast } from "sonner";

import { updateProduct } from "@/actions/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/general";

import CategorySelector from "../../add/_components/CategorySelector";
import DeliveryMethod from "../../add/_components/DeliveryMethod";
import DetailImagesUploader from "../../add/_components/DetailImagesUploader";
import ImagesUploader from "../../add/_components/ImagesUploader";
import Price from "../../add/_components/Price";
import ProductOptions from "../../add/_components/ProductOptions";
import ProductTitle from "../../add/_components/ProductTitle";
import { Context } from "../../add/_providers/ContextProvider";

export default function EditProductForm() {
  const router = useRouter();
  const [context, setContext] = useContext(Context);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const result = await updateProduct({
        id: context.id,
        productMainImages: context.productMainImages,
        productImages: context.productImages,
        name: context.name,
        description: context.description,
        price: context.price,
        options: context.options,
        delivery: context.delivery,
        discountRate: context.discountRate,
        category: context.category,
        stock: context.stock ?? 0,
        existingMainImages: context.existingMainImages ?? [],
        existingDetailImages: context.existingDetailImages ?? [],
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("상품이 수정되었습니다");
      router.push(ROUTES.MANAGE_PRODUCT);
    } catch (error) {
      console.error(error);
      toast.error("상품 수정 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-xl font-bold">메인 이미지</h2>
        <ImagesUploader />
      </section>

      <div className="h-0.5 bg-gray-300" />

      <section>
        <h2 className="mb-4 text-xl font-bold">상세 이미지</h2>
        <DetailImagesUploader />
      </section>

      <div className="h-0.5 bg-gray-300" />

      <section>
        <h2 className="mb-4 text-xl font-bold">상품 타이틀</h2>
        <ProductTitle />
      </section>

      <div className="h-0.5 bg-gray-300" />

      <section>
        <h2 className="mb-4 text-xl font-bold">재고</h2>
        <div className="flex gap-4">
          <div className="w-32 space-y-2">
            <Label htmlFor="stock">재고</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={context.stock ?? ""}
              onChange={(e) =>
                setContext((prev) => ({
                  ...prev,
                  stock: parseInt(e.target.value) || 0,
                }))
              }
              placeholder="재고를 입력해주세요"
            />
          </div>
        </div>
      </section>

      <div className="h-0.5 bg-gray-300" />

      <section>
        <h2 className="mb-4 text-xl font-bold">상품 카테고리</h2>
        <CategorySelector />
      </section>

      <div className="h-0.5 bg-gray-300" />

      <section>
        <h2 className="mb-4 text-xl font-bold">상품 옵션</h2>
        <ProductOptions />
      </section>

      <div className="h-0.5 bg-gray-300" />

      <section>
        <h2 className="mb-4 text-xl font-bold">배송 방법</h2>
        <DeliveryMethod />
      </section>

      <div className="h-0.5 bg-gray-300" />

      <section>
        <h2 className="mb-4 text-xl font-bold">가격</h2>
        <Price />
      </section>

      <div className="h-0.5 bg-gray-300" />

      <div className="pt-4">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-lg bg-black px-8 py-2 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              저장 중...
            </>
          ) : (
            "저장"
          )}
        </button>
      </div>
    </div>
  );
} 