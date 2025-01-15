"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { toast } from "sonner";

import { createProduct } from "@/actions/admin";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/general";

import CategorySelector from "./CategorySelector";
import DeliveryMethod from "./DeliveryMethod";
import DetailImagesUploader from "./DetailImagesUploader";
import ImagesUploader from "./ImagesUploader";
import Price from "./Price";
import ProductOptions from "./ProductOptions";
import ProductTitle from "./ProductTitle";
import { Context } from "../_providers/ContextProvider";

interface AddProductFormProps {
  initialCategories: {
    id: number;
    name: string;
    subCategory: {
      id: number;
      name: string;
      categoryId: number;
    }[];
  }[];
}

export default function AddProductForm({
  initialCategories,
}: AddProductFormProps) {
  const [context, setContext] = useContext(Context);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const transformCategories = (categories: typeof context.categories) => {
    const categoryIds = categories
      .map((cat) => cat.categoryId)
      .filter((id) => !isNaN(id));
    const subCategoryIds = categories
      .flatMap((cat) => cat.subCategoryIds)
      .filter((id) => !isNaN(id));

    return {
      category: categoryIds,
      subCategory: subCategoryIds,
    };
  };

  const handleSubmit = async () => {
    try {
      if (!context.name) {
        toast.error("상품명을 입력해주세요");
        return;
      }
      if (!context.description) {
        toast.error("상품 설명을 입력해주세요");
        return;
      }
      if (context.price < 0) {
        toast.error("판매가는 0원 이상이어야 합니다");
        return;
      }
      if (context.productMainImages.length === 0) {
        toast.error("메인 이미지를 한 개 이상 업로드해주세요");
        return;
      }
      if (context.productImages.length === 0) {
        toast.error("상세 이미지를 한 개 이상 업로드해주세요");
        return;
      }
      if (context.categories.length === 0) {
        toast.error("카테고리를 선택해주세요");
        return;
      }

      setIsLoading(true);

      const { category, subCategory } = transformCategories(context.categories);

      if (category.length === 0) {
        toast.error("유효한 카테고리를 선택해주세요");
        return;
      }

      const formData = {
        productMainImages: context.productMainImages,
        productImages: context.productImages,
        name: context.name.trim(),
        description: context.description.trim(),
        price: context.price,
        options: context.options,
        delivery: context.delivery,
        specialDelivery: context.specialDelivery,
        discountRate: context.discountRate,
        category,
        subCategory,
        stock: context.stock ?? 0,
        status: context.status,
        isNew: context.isNew,
        isRecommended: context.isRecommended,
      };

      const result = await createProduct(formData);

      if (!result?.success) {
        const errorMessage = result?.message || "상품 등록에 실패했습니다";
        console.error("Product creation failed:", errorMessage);
        toast.error(errorMessage);
        return;
      }

      toast.success("상품이 등록되었습니다");
      router.push(ROUTES.MANAGE_PRODUCT);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        "상품 등록 중 오류가 발생했습니다. 모든 필수 항목을 확인해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="space-y-8 p-8">
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
                defaultChecked
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
    </main>
  );
}
