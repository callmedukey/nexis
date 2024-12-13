"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantityInputProps {
  max: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function QuantityInput({
  max,
  value,
  onChange,
  className,
}: QuantityInputProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between rounded-full border border-input bg-background p-1",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="size-12 rounded-full hover:bg-accent hover:text-accent-foreground"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
      >
        <Minus className="size-6" />
      </Button>
      <div className="w-24 text-center">
        <span className="text-2xl font-semibold">{value}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-12 rounded-full hover:bg-accent hover:text-accent-foreground"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus className="size-6" />
      </Button>
    </div>
  );
}
