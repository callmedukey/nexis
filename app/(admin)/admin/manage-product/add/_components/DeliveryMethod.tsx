"use client";

import { useContext } from "react";

import { Label } from "@/components/ui/label";

import { Context } from "../_providers/ContextProvider";

const DeliveryMethod = () => {
  const [context, setContext] = useContext(Context);

  const handleDeliveryChange = (type: "탁송" | "직수령") => {
    setContext({
      ...context,
      delivery: type,
    });
  };

  return (
    <div className="flex items-center gap-4">
      <Label className="text-sm font-medium">택배</Label>
      <div className="flex gap-2">
        <button
          onClick={() => handleDeliveryChange("탁송")}
          className={`rounded-lg px-4 py-2 ${
            context.delivery === "탁송"
              ? "bg-black text-white"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          탁송
        </button>
        <button
          onClick={() => handleDeliveryChange("직수령")}
          className={`rounded-lg px-4 py-2 ${
            context.delivery === "직수령"
              ? "bg-black text-white"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          직수령
        </button>
      </div>
    </div>
  );
};

export default DeliveryMethod;
