"use client";

import { ProductStatus } from "@prisma/client";
import { createContext, useState } from "react";

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

const initialState: ProductFormState = {
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
  isNew: true,
  isRecommended: false,
};

export const Context = createContext<
  [ProductFormState, React.Dispatch<React.SetStateAction<ProductFormState>>]
>([initialState, () => {}]);

interface ContextProviderProps {
  children: React.ReactNode;
  initialData?: ProductFormState;
}

export default function ContextProvider({
  children,
  initialData,
}: ContextProviderProps) {
  const [state, setState] = useState<ProductFormState>(
    initialData ?? initialState
  );

  return (
    <Context.Provider value={[state, setState]}>{children}</Context.Provider>
  );
}
