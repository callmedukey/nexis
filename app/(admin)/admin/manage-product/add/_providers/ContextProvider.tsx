"use client";

import { createContext, useContext, useState } from "react";

export interface ProductFormState {
  id?: number;
  name: string;
  description: string;
  price: number;
  options: string[];
  delivery: "탁송" | "직수령";
  discountRate: number;
  category: string[];
  stock: number;
  productMainImages: File[];
  productImages: File[];
  existingMainImages?: { id: number; url: string }[];
  existingDetailImages?: { id: number; url: string }[];
}

const initialState: ProductFormState = {
  name: "",
  description: "",
  price: 0,
  options: [],
  delivery: "직수령",
  discountRate: 0,
  category: [],
  stock: 0,
  productMainImages: [],
  productImages: [],
  existingMainImages: [],
  existingDetailImages: [],
};

export const Context = createContext<
  [ProductFormState, React.Dispatch<React.SetStateAction<ProductFormState>>]
>([initialState, () => {}]);

export default function ContextProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: Partial<ProductFormState>;
}) {
  const [state, setState] = useState<ProductFormState>({
    ...initialState,
    ...initialData,
  });

  return (
    <Context.Provider value={[state, setState]}>{children}</Context.Provider>
  );
}
