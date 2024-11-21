"use client";
import { signIn } from "next-auth/react";

import { ROUTES } from "@/constants/general";

const KakaoButton = () => {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await signIn("naver", {
          callbackUrl: ROUTES.AFTER_LOGIN,
          redirect: false,
        });
      }}
    >
      <button>Click</button>
    </form>
  );
};

export default KakaoButton;
