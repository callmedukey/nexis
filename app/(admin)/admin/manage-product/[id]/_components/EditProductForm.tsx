"use client";

import type { Category } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { toast } from "sonner";

import { updateProduct } from "@/actions/admin";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import EditDetailImagesUploader from "./EditDetailImagesUploader";
import EditImagesUploader from "./EditImagesUploader";
import CategorySelector from "../../add/_components/CategorySelector";
import DeliveryMethod from "../../add/_components/DeliveryMethod";
import Price from "../../add/_components/Price";
import ProductOptions from "../../add/_components/ProductOptions";
import ProductTitle from "../../add/_components/ProductTitle";
import { Context } from "../../add/_providers/ContextProvider";

interface Props {
  initialCategories: (Category & {
    subCategory: {
      id: number;
      name: string;
      categoryId: number;
    }[];
  })[];
}

export default function EditProductForm({ initialCategories }: Props) {
  const router = useRouter();
  const [context, setContext] = useContext(Context);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      // Check if there are either new images or existing images
      const hasMainImages =
        context.productMainImages.length > 0 ||
        (context.existingMainImages && context.existingMainImages.length > 0);
      const hasDetailImages =
        context.productImages.length > 0 ||
        (context.existingDetailImages &&
          context.existingDetailImages.length > 0);

      if (!hasMainImages) {
        toast.error("메인 이미지를 한 개 이상 업로드해주세요");
        return;
      }

      if (!hasDetailImages) {
        toast.error("상세 이미지를 한 개 이상 업로드해주세요");
        return;
      }

      setIsLoading(true);

      // Transform categories to match schema
      const category = context.categories.map((cat) =>
        cat.categoryId.toString()
      );
      const subCategory = context.categories
        .flatMap((cat) => cat.subCategoryIds.map((id) => id.toString()))
        .filter(Boolean);

      const result = await updateProduct({
        id: context.id!,
        productMainImages: context.productMainImages,
        productImages: context.productImages,
        name: context.name,
        description: context.description,
        price: context.price,
        options: context.options,
        delivery: context.delivery,
        discountRate: context.discountRate,
        category,
        subCategory,
        stock: context.stock ?? 0,
        existingMainImages: context.existingMainImages ?? [],
        existingDetailImages: context.existingDetailImages ?? [],
        status: context.status,
        isNew: context.isNew,
        isRecommended: context.isRecommended,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push("/admin/manage-product");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("상품 수정에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-8">
      <section>
        <h2 className="mb-4 text-xl font-bold">메인 이미지</h2>
        <EditImagesUploader />
      </section>

      <div className="h-0.5 bg-gray-300" />

      <section>
        <h2 className="mb-4 text-xl font-bold">상세 이미지</h2>
        <EditDetailImagesUploader />
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
        <CategorySelector categories={initialCategories} />
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

      <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">상품 설정</h2>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isNew"
                checked={context.isNew}
                onCheckedChange={(checked) =>
                  setContext((prev) => ({
                    ...prev,
                    isNew: checked === true,
                  }))
                }
              />
              <label
                htmlFor="isNew"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                신제품
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecommended"
                checked={context.isRecommended}
                onCheckedChange={(checked) =>
                  setContext((prev) => ({
                    ...prev,
                    isRecommended: checked === true,
                  }))
                }
              />
              <label
                htmlFor="isRecommended"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                추천 제품
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="specialDelivery"
                checked={context.specialDelivery}
                onCheckedChange={(checked) =>
                  setContext((prev) => ({
                    ...prev,
                    specialDelivery: checked === true,
                  }))
                }
              />
              <label
                htmlFor="specialDelivery"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                화물배송
              </label>
            </div>
          </div>
        </div>
      </div>

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
