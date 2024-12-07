import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = [
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/avif",
] as const;

export const PRODUCT_CATEGORIES = [
  "버스 부품",
  "버스 용품",
  "인테리어 소품",
  "음향 장비",
  "장식장",
  "조명",
  "시트",
  "full smart",
] as const;

export const productSchema = z.object({
  name: z.string().min(1, "상품명을 입력해주세요"),
  description: z.string().min(1, "상품 설명을 입력해주세요"),
  price: z.number().min(1, "가격을 입력해주세요"),
  discountRate: z
    .number()
    .min(0, "할인율은 0 이상이어야 합니다")
    .max(100, "할인율은 100 이하여야 합니다"),
  category: z.array(z.string()).min(1, "카테고리를 선택해주세요"),
  stock: z.number().min(0, "재고는 0 이상이어야 합니다").default(0),
  productMainImages: z
    .array(
      z
        .instanceof(File)
        .refine(
          (file) => ACCEPTED_IMAGE_TYPES.includes(file.type as any),
          "지원되는 이미지 형식: SVG, PNG, JPG, JPEG, GIF, WebP, AVIF"
        )
    )
    .min(1, "메인 이미지를 한 개 이상 업로드해주세요"),
  productImages: z
    .array(
      z
        .instanceof(File)
        .refine(
          (file) => ACCEPTED_IMAGE_TYPES.includes(file.type as any),
          "지원되는 이미지 형식: SVG, PNG, JPG, JPEG, GIF, WebP, AVIF"
        )
    )
    .min(1, "상세 이미지를 한 개 이상 업로드해주세요"),
  options: z.array(z.string()),
  delivery: z.enum(["탁송", "직수령"]),
});

export type ProductFormData = z.infer<typeof productSchema>;
