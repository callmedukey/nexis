"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-background to-secondary/10">
      <Card className="w-[400px] border-none shadow-none backdrop-blur-sm">
        <CardHeader className="pb-8">
          <CardTitle className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-center text-3xl font-bold text-transparent">
            로그인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full shadow-none"
              onClick={() => signIn("naver", { callbackUrl: "/" })}
            >
              <Image
                src="/naver-icon.svg"
                alt="Naver"
                width={20}
                height={20}
                className="mr-2"
              />
              네이버로 로그인
            </Button>

            <Button
              variant="outline"
              className="w-full shadow-none"
              onClick={() => signIn("kakao", { callbackUrl: "/" })}
            >
              <Image
                src="/kakao-icon.svg"
                alt="Kakao"
                width={20}
                height={20}
                className="mr-2"
              />
              카카오로 로그인
            </Button>

            <p className="mt-6 break-keep text-center text-sm text-muted-foreground">
              소셜 로그인으로 별도의 회원가입 없이 <br /> 바로 이용하실 수
              있습니다
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
