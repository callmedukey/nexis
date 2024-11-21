"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
  DrawerDescription,
} from "@/components/ui/drawer";
import { ROUTES } from "@/constants/general";
import KAKAO_LOGIN_IMG from "@/public/kakao.png";
import NAVER_LOGIN_IMG from "@/public/naver_login.png";

const RegisterDrawer = () => {
  const [open, setOpen] = useState(false);

  const handleLogin = async (provider: "naver" | "kakao") => {
    await signIn(provider, { callbackUrl: ROUTES.HOME, redirect: false });
  };

  return (
    <Drawer direction="bottom" open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        className="w-full px-2 py-1.5 text-left text-lg leading-none focus:outline-none"
        aria-label="회원가입 메뉴"
      >
        회원가입
      </DrawerTrigger>
      <DrawerContent className="flex min-h-[200px] space-y-4 !py-4 px-8 text-xl sm:min-h-[150px]">
        <DrawerTitle className="sr-only">회원가입</DrawerTitle>
        <DrawerDescription className="sr-only">회원가입 메뉴</DrawerDescription>
        <div className="relative mx-auto flex w-full flex-col items-center justify-center gap-4">
          <strong className="text-sm">
            카카오 / 네이버 로그인시 편하게 회원가입부터 로그인까지 한번에!
          </strong>
          <div className="relative flex w-full flex-col items-center justify-center gap-2 sm:flex-row">
            <button
              className="relative h-20 w-full"
              type="button"
              onClick={() => handleLogin("naver")}
            >
              <Image
                src={NAVER_LOGIN_IMG}
                alt="naver login"
                width={750}
                height={200}
                priority
                className="h-20 w-full object-fill"
                quality={100}
              />
            </button>
            <button
              className="relative h-20 w-full"
              type="button"
              onClick={() => handleLogin("kakao")}
            >
              <Image
                src={KAKAO_LOGIN_IMG}
                quality={100}
                priority
                alt="kakao login"
                width={600}
                height={90}
                className="h-20 w-full object-fill"
              />
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default RegisterDrawer;
