"use server";

import { signOut, signIn } from "@/auth";
import { ROUTES } from "@/constants/general";

export const logoutUser = async () => {
  await signOut({ redirectTo: ROUTES.HOME });
};

export const loginUser = async ({
  provider,
  callbackUrl,
  redirect,
}: {
  provider: "naver" | "kakao";
  callbackUrl: string;
  redirect: boolean;
}) => {
  await signIn(provider, { callbackUrl, redirect });
};
