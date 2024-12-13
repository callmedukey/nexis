"use client";

import { useEffect } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProduct } from "./ProductContext";

interface OptionsSelectProps {
  options: string[];
}

export function OptionsSelect({ options }: OptionsSelectProps) {
  const { selectedOption, setSelectedOption } = useProduct();

  // Reset selected option when unmounting
  useEffect(() => {
    return () => {
      setSelectedOption(null);
    };
  }, [setSelectedOption]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">옵션</label>
      <Select
        value={selectedOption || ""}
        onValueChange={setSelectedOption}
      >
        <SelectTrigger>
          <SelectValue placeholder="옵션을 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 