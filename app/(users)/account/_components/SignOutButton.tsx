"use client";

import { signOut } from "next-auth/react";

import { ROUTES } from "@/constants/general";

const SignOutButton = () => {
  return (
    <button
      className="w-full cursor-pointer rounded-full bg-primaryblack px-4 py-2 font-normal text-white transition-opacity duration-300 ~text-sm/lg ~mt-16/24 hover:opacity-70"
      onClick={async () => {
        await signOut({ redirectTo: ROUTES.HOME });
      }}
    >
      로그아웃
    </button>
  );
};

export default SignOutButton;
