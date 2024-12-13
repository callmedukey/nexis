import Image from "next/image";

import Chat from "@/public/kakao-channel.webp";
import Phone from "@/public/phone.webp";

export default function CustomerServicePage() {
  return (
    <main className="mx-auto max-w-screen-lg px-4 py-8">
      <div className="flex flex-col items-center">
        <h1 className="text-lg font-bold">고객센터</h1>

        <div className="mt-6 space-y-8">
          <div className="flex flex-col items-start space-y-4">
            <h2 className="text-base font-bold">운영시간</h2>
            <div className="text-left text-muted-foreground">
              <p>오전 9시 - 오후 6시</p>
              <p>오후 12시 - 오후 2시</p>
            </div>
          </div>

          <div className="flex flex-col items-start space-y-4">
            <h2 className="text-base font-bold">전화 상담</h2>
            <p className="text-base font-light text-icongray underline">
              1599-5863
            </p>
          </div>

          <div className="text-sm text-icongray">
            <p>주말/공휴일 휴무 운영시간 외 답변이 늦어질 수 있어요</p>
          </div>

          <div className="!mt-4 text-sm text-icongray">
            <p className="mb-4">
              아래 버튼을 눌러 문의 남겨 주시면 빠르게 답변 드리겠습니다
            </p>
            <div className="mt-12 flex items-center justify-around gap-x-12">
              <Image src={Chat} alt="카카오 채널" className="size-16" />
              <Image src={Phone} alt="전화 상담" className="size-16" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
