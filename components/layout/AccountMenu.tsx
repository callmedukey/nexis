"use client";

import { UserRound } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AUTH_ACCOUNT_ROUTES,
  AUTH_ROUTES,
  ICONGRAY,
  ROUTES,
} from "@/constants/general";

import LoginMenu from "./LoginDrawer";
import RegisterDrawer from "./RegisterDrawer";
import SignOutButton from "./SignOutButton";

const AccountMenu = () => {
  const session = useSession();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserRound color={ICONGRAY} className="size-6 cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="text-lg">
        <DropdownMenuLabel className="text-center text-base font-medium">
          계정 메뉴
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {session && session?.data && session?.data?.user
          ? AUTH_ACCOUNT_ROUTES.map((link) => {
              if (link.url === ROUTES.LOGOUT) {
                return (
                  <DropdownMenuItem key={link.label}>
                    <SignOutButton />
                  </DropdownMenuItem>
                );
              }

              return (
                <DropdownMenuItem key={link.label}>
                  <Link href={link.url} className="cursor-pointer text-base">
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              );
            })
          : AUTH_ROUTES.map((link) => {
              if (link.url === ROUTES.LOGIN) {
                return (
                  <DropdownMenuItem key={link.label} asChild>
                    <LoginMenu key={link.label} />
                  </DropdownMenuItem>
                );
              }
              if (link.url === ROUTES.SIGNUP) {
                return (
                  <DropdownMenuItem key={link.label} asChild>
                    <RegisterDrawer key={link.label} />
                  </DropdownMenuItem>
                );
              }

              return (
                <DropdownMenuItem key={link.label}>
                  <Link href={link.url} className="cursor-pointer text-base">
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
        {session &&
          session.data &&
          session.data.user &&
          session.data.user.isAdmin && (
            <DropdownMenuItem>
              <Link href={ROUTES.ADMIN} className="cursor-pointer text-base">
                관리자
              </Link>
            </DropdownMenuItem>
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountMenu;
