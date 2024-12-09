"use client";

import { FileInput } from "@/components/extension/file-uploader";

import { FileSvgDraw } from "./FileSvgDraw";

export function FileInputWrapper() {
  return (
    <FileInput className="outline-dashed outline-1 outline-white">
      <div className="flex w-full flex-col items-center justify-center py-4">
        <FileSvgDraw />
      </div>
    </FileInput>
  );
}
