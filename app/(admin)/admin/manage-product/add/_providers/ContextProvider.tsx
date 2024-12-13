"use client";

import { ProductStatus } from "@prisma/client";
import { Dispatch, SetStateAction, createContext, useState } from "react";

interface CategorySelection {
  categoryId: number;
  subCategoryIds: number[];
}

export interface ProductFormState {
  id?: number;
  productMainImages: File[];
  productImages: File[];
  name: string;
  description: string;
  price: number;
  options: string[];
  delivery: boolean;
  discountRate: number;
  categories: CategorySelection[];
  stock: number;
  existingMainImages?: Array<{ id: number; url: string }>;
  existingDetailImages?: Array<{ id: number; url: string }>;
  status: ProductStatus;
  isNew: boolean;
  isRecommended: boolean;
}

type ContextType = [ProductFormState, Dispatch<SetStateAction<ProductFormState>>];

export const Context = createContext<ContextType>([
  {
    name: "",
    price: 0,
    discountRate: 0,
    description: "",
    status: ProductStatus.ACTIVE,
    stock: 0,
    delivery: false,
    options: [],
    categories: [],
    productMainImages: [],
    productImages: [],
    isNew: false,
    isRecommended: false,
  },
  () => {},
]);

interface ContextProviderProps {
  children: React.ReactNode;
  initialData?: ProductFormState;
}

export default function ContextProvider({
  children,
  initialData,
}: ContextProviderProps) {
  const [state, setState] = useState<ProductFormState>(
    initialData ?? {
      name: "",
      price: 0,
      discountRate: 0,
      description: "",
      status: ProductStatus.ACTIVE,
      stock: 0,
      delivery: false,
      options: [],
      categories: [],
      productMainImages: [],
      productImages: [],
      isNew: false,
      isRecommended: false,
    }
  );

  return (
    <Context.Provider value={[state, setState]}>{children}</Context.Provider>
  );
}
