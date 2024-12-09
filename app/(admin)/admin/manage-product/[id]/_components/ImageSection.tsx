"use client";

import DetailImagesUploader from "../../add/_components/DetailImagesUploader";
import EditImagesUploader from "./EditImagesUploader";

export default function ImageSection() {
  return (
    <>
      <section>
        <h2 className="mb-4 text-xl font-bold">메인 이미지</h2>
        <EditImagesUploader />
      </section>

      <div className="h-0.5 bg-gray-300" />

      <section>
        <h2 className="mb-4 text-xl font-bold">상세 이미지</h2>
        <DetailImagesUploader />
      </section>
    </>
  );
}
