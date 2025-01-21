import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="px-4 py-12 sm:py-6">
      <div className="mx-auto grid sm:grid-cols-2 max-w-screen-lg text-center gap-y-8 sm:text-left">
        <dl className="sm:order-2 md:justify-self-center space-y-4">
          <dt className="text-base font-bold">고객센터</dt>
          <dd className="text-base">TEL: 1688-6368</dd>
        </dl>
        <div className="h-[1px] bg-black max-w-[8rem] mx-auto w-full sm:hidden" />
        <dl className="[&>div]:flex [&>div]:gap-2 [&>div]:~text-xs/base space-y-2 [&>div]:justify-center [&>div]:sm:justify-start">
          <div>
            <dt>대표:</dt>
            <dd>이강산</dd>
          </div>
          <div>
            <dt>사업자등록번호:</dt>
            <dd>318-86-02107</dd>
          </div>
          <div>
            <dt>통신판매업신고번호:</dt>
            <dd>2024-인천중구-0334</dd>
          </div>
          <div>
            <dt>주소:</dt>
            <dd>인천 중구 젓개로 107 2동 (우)22356</dd>
          </div>
        </dl>
      </div>
    </footer>
  );
};

export default Footer;
