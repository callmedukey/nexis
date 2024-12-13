import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROUTES } from "@/constants/general";
import prisma from "@/lib/prisma";

import SignOutButton from "./_components/SignOutButton";

const page = async () => {
  const session = await auth();
  if (!session || !session.user.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: {
      providerId: session.user.id,
    },
  });

  if (!user) {
    redirect("/");
  }

  if (!user?.name || !user?.email || !user?.phone) {
    redirect("/account/profile?redirect=true");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-screen-sm flex-col items-center justify-start px-4 ~py-6/12">
      <div className="w-full border-b border-black py-4 font-bold ~text-lg/2xl ~pl-8/16">
        {user?.name}
      </div>
      <div className="flex w-full flex-col gap-4 text-icongray ~py-8/12 ~pl-8/16">
        <Link
          href={ROUTES.PURCHASES}
          className="flex items-center justify-between hover:font-bold"
        >
          구매내역 <ChevronRight />
        </Link>
        <Link
          href={ROUTES.PROFILE}
          className="flex items-center justify-between hover:font-bold"
        >
          계정 관리 <ChevronRight />
        </Link>
        <Link
          href={ROUTES.CS}
          className="flex items-center justify-between hover:font-bold"
        >
          고객센터 <ChevronRight />
        </Link>
      </div>
      <SignOutButton />
    </main>
  );
};

export default page;
