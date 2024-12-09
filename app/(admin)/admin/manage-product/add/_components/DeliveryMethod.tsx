"use client";

import { useContext } from "react";

import { Label } from "@/components/ui/label";

import { Context } from "../_providers/ContextProvider";

export default function DeliveryMethod() {
  const [context, setContext] = useContext(Context);

  const handleDeliveryChange = (isDelivery: boolean) => {
    setContext((prev) => ({
      ...prev,
      delivery: isDelivery,
    }));
  };

  return (
    <div className="flex items-center gap-4">
      <Label className="text-sm font-medium">택배</Label>
      <div className="flex gap-2">
        <button
          onClick={() => handleDeliveryChange(true)}
          className={`rounded-lg px-4 py-2 ${
            context.delivery
              ? "bg-black text-white"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          탁송
        </button>
        <button
          onClick={() => handleDeliveryChange(false)}
          className={`rounded-lg px-4 py-2 ${
            !context.delivery
              ? "bg-black text-white"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          직수령
        </button>
      </div>
    </div>
  );
}
