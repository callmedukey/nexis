"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ProductContextType {
  selectedOption: string | null;
  setSelectedOption: (option: string | null) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <ProductContext.Provider value={{ selectedOption, setSelectedOption }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
} 