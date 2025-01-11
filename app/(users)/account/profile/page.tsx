import { redirect } from "next/navigation";
import Script from "next/script";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

import AddressUpdateDrawer from "./_components/AddressUpdateDrawer";
import ProfileEditDrawer from "./_components/ProfileEditDrawer";

const page = async ({
  searchParams,
}: {
  searchParams: { redirect: string };
}) => {
  const awaitedSearchParams = await searchParams;
  const isRedirected = awaitedSearchParams.redirect === "true";
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: {
      providerId: session?.user?.id,
    },
  });

  if (!user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex max-w-screen-sm flex-col items-center justify-center px-4 ~py-6/12">
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        async
        strategy="lazyOnload"
      />
      <div className="w-full border-b border-black py-4 font-bold ~text-lg/2xl ~pl-8/16">
        계정 관리
      </div>
      <div className="w-full ~py-8/12 ~pl-8/16">
        <h1 className="font-bold ~text-xs/lg ~mb-8/12">회원 정보</h1>
        <div className="grid grid-cols-[auto_1fr] gap-4 ~text-xs/lg">
          <div className=" font-light text-icongray">고객명</div>
          <div className="font-normal text-primaryblack">
            {user?.name ?? ""}
          </div>
          <div className=" font-light text-icongray">이메일</div>
          <div className="font-normal text-primaryblack">
            {user?.email ?? ""}
          </div>
          <div className=" font-light text-icongray">연락처</div>
          <div className="font-normal text-primaryblack">
            {user?.phone ?? ""}
          </div>
          <ProfileEditDrawer
            isRedirected={isRedirected}
            initialData={{
              name: user?.name,
              email: user?.email,
              phone: user?.phone,
            }}
          />
        </div>
      </div>
      <div className="w-full ~py-8/12 ~pl-8/16">
        <h1 className="font-bold ~text-xs/lg ~mb-8/12">배송지</h1>
        <div className="grid grid-cols-[auto_1fr] gap-4 ~text-xs/lg">
          <div className=" font-light text-icongray">주소</div>
          <div className="font-normal text-primaryblack">
            {user?.address ?? ""}
          </div>
          <div className=" font-light text-icongray">상세 주소</div>
          <div className="font-normal text-primaryblack">
            {user?.detailedAddress ?? ""}
          </div>
          <div className=" font-light text-icongray">우편번호</div>
          <div className="font-normal text-primaryblack">
            {user?.zipcode ?? ""}
          </div>
          <AddressUpdateDrawer
            initialData={{
              address: user?.address,
              zipcode: user?.zipcode,
              detailedAddress: user?.detailedAddress,
            }}
          />
        </div>
      </div>
    </main>
  );
};

export default page;
