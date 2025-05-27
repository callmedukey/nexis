import { redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";

import CartClient from "./CartClient";

const page = async () => {
  const session = await auth();

  if (!session || !session?.user?.id) {
    return redirect("/login");
  }

  return <CartClient />;
};

export default page;
