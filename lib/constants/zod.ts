import { ProductStatus } from "@prisma/client";
import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = [
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/avif",
] as const;

export const productSchema = z.object({
  name: z.string().min(1, "상품명을 입력해주세요"),
  description: z.string().min(1, "상품 설명을 입력해주세요"),
  price: z.number().min(0, "판매가는 0원 이상이어야 합니다"),
  discountRate: z
    .number()
    .min(0, "할인율은 0 이상이어야 합니다")
    .max(100, "할인율은 100 이하여야 합니다"),
  category: z.array(z.number()).min(1, "카테고리를 선택해주세요"),
  subCategory: z.array(z.number()),
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
  delivery: z.boolean().default(false),
  specialDelivery: z.boolean().default(false),
  status: z.nativeEnum(ProductStatus).optional(),
  isNew: z.boolean().default(true),
  isRecommended: z.boolean().default(false),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const UserProfileSchema = z.object({
  name: z.string().min(1, "고객명을 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  phone: z.string().min(1, "연락처를 입력해주세요"),
});

export const AddressSchema = z.object({
  address: z.string().min(1, "주소를 입력해주세요"),
  detailedAddress: z.string().optional(),
  zipcode: z.string().min(1, "상세 주소를 입력해주세요"),
});

export type UserProfileData = z.infer<typeof UserProfileSchema>;
export type AddressData = z.infer<typeof AddressSchema>;
