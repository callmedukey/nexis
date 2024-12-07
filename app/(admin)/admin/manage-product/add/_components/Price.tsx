"use client";

import { useContext } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Context } from "../_providers/ContextProvider";

const Price = () => {
  const [context, setContext] = useContext(Context);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="price">판매가</Label>
          <Input
            id="price"
            type="number"
            value={context.price ?? ""}
            onChange={(e) =>
              setContext({ ...context, price: parseInt(e.target.value) || 0 })
            }
            placeholder="판매가를 입력해주세요"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="discount">할인 %</Label>
          <Input
            id="discount"
            type="number"
            min="0"
            max="100"
            value={context.discountRate ?? ""}
            onChange={(e) =>
              setContext({
                ...context,
                discountRate: parseInt(e.target.value) || 0,
              })
            }
            placeholder="할인율을 입력해주세요"
          />
        </div>
      </div>
    </div>
  );
};

export default Price;
