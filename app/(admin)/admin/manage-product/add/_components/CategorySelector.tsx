"use client";

import { useContext } from "react";

import { Context } from "../_providers/ContextProvider";
import { PRODUCT_CATEGORIES } from "@/lib/constants/zod";

const CategorySelector = () => {
  const [context, setContext] = useContext(Context);

  const handleCategoryChange = (category: string) => {
    setContext((prev) => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter((c) => c !== category)
        : [...prev.category, category],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {context.category.map((cat) => (
          <div
            key={cat}
            className="flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-sm"
          >
            <span>{cat}</span>
            <button
              onClick={() => handleCategoryChange(cat)}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {PRODUCT_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`rounded-md px-3 py-2 text-sm transition-colors ${
              context.category.includes(category)
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector; 