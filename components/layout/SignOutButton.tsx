"use client";

import { signOut } from "next-auth/react";

import { ROUTES } from "@/constants/general";

const SignOutButton = () => {
  return (
    <button
      className="cursor-pointer font-noto text-base font-normal"
      onClick={async () => {
        await signOut({ redirectTo: ROUTES.HOME });
      }}
    >
      로그아웃
    </button>
  );
};

export default SignOutButton;
