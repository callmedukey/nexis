import { Metadata } from "next";

export const metadata: Metadata = {
  title: "배송/환불 정책 | Nexis",
  description: "Nexis의 배송 및 환불 정책 안내",
};

export default function DeliveryAndRefundPolicy() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">배송 및 환불 정책</h1>

      <section className="mb-8 mt-24 text-pretty break-keep">
        <h2 className="text-2xl font-semibold mb-4">▣배송안내</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">배송 방법</span> : 로젠택배
          </p>
          <p>
            <span className="font-medium">배송 지역</span> : 전국
          </p>
          <p>
            <span className="font-medium">배송 비용</span> : (장식장,조명 제품
            제외) 무료
          </p>
          <p>
            <span className="font-medium">배송 기간</span> : 2-3일
          </p>
          <div className="mt-4">
            <p className="font-medium">배송 안내 :</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                산간벽지나 도서지방은 별도의 추가금액을 지불하셔야 하는 경우가
                있습니다. 고객님께서 주문하신 상품은 입금 확인후 배송해
                드립니다. 다만, 상품종류에 따라서 상품의 배송이 다소 지연될 수
                있습니다.
              </li>
              <li>
                장식장 품목은 화물로 받으실 수 있기에, 구매 확인 후 해피콜로
                스케줄 및 추가 운임비 안내를 해드립니다.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">▣A/S안내</h2>
        <div className="space-y-2">
          <p>
            제품의 초기불량을 발견하게 되신다면 고객센터로 전화를 주시면 안내
            받을 수 있습니다.
          </p>
          <p>전자제품,장식장은 구매 후 1년간 무상 A/S를 받으실 수 있습니다.</p>
          <ul className="list-disc pl-5 mt-2">
            <li>
              제품 A/S택배 발송시 '성명/연락처/주소'를 기재하여 메모 동봉
              부탁드립니다.
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">▣교환/반품안내</h2>
        <div className="space-y-4">
          <div>
            <p className="font-medium">교환 및 반품 주소</p>
            <p>인천 중구 젓개로 107 2동 (주)카일루스</p>
          </div>

          <div>
            <p className="font-medium">교환 및 반품이 가능한 경우</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                제품 수령 후 제품에 문제가 있을 시 3일 이내 고객센터로 반품
                접수를 원칙으로 합니다.
              </li>
              <li>제품 파손시 수령 당일 접수해야 보상처리가 가능합니다.</li>
              <li>제품 설치 전</li>
            </ul>
          </div>

          <div>
            <p className="font-medium">교환 및 반품이 불가능한 경우</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                이용자에게 책임 있는 사유로 재화 등이 멸실 또는 훼손된
                경우(찍힘,긁힘,낙서,이물질,음식물)
              </li>
              <li>
                이용자의 사용 또는 일부 소비에 의하여 재화 등의 가치가 현저히
                감소한 경우
              </li>
              <li>
                시간의 경과에 의하여 재판매가 곤란할 정도로 재화등의 가치가
                현저히 감소한 경우
              </li>
              <li>제품 설치 후</li>
            </ul>
          </div>

          <p className="text-sm mt-4">
            ※ 고객님의 마음이 바뀌어 교환, 반품을 하실 경우 상품반송 비용은
            고객님께서 부담하셔야 합니다.
            <br />
            (색상 교환, 사이즈 교환 등 포함)
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">▣환불안내</h2>
        <div className="space-y-2">
          <p>
            환불시 반품 확인여부를 확인한 후 3영업일 이내에 결제 금액을 환불해
            드립니다.
          </p>
          <p>
            신용카드로 결제하신 경우는 신용카드 승인을 취소하여 결제 대금이
            청구되지 않게 합니다.
          </p>
          <p className="text-sm">
            (단, 신용카드 결제일자에 맞추어 대금이 청구 될수 있으면 이경우 익월
            신용카드 대금청구시 카드사에서 환급처리 됩니다.)
          </p>
        </div>
      </section>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-center">
          원활한 소통과 빠른 업무처리를 위하여
          <br />
          고객센터로 연락주시면 고객님께 빠른 서비스를 제공합니다.
        </p>
      </div>
    </main>
  );
}
