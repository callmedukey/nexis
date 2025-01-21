import Link from "next/link";
const ConditionsFooter = () => {
  return (
    <aside className="border-t border-[#111111] px-4 py-4">
      <div className="mx-auto max-w-screen-lg text-center sm:text-left flex gap-4 md:gap-8 text-sm opacity-80">
        <Link href="/delivery-and-refund-policy">배송 안내 및 환불 정책</Link>
      </div>
    </aside>
  );
};

export default ConditionsFooter;
