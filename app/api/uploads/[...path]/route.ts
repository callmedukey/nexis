import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { stat, readFile } from "fs/promises";

type RouteContext = {
  params: {
    path: string[];
  };
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const filePath = join(process.cwd(), "uploads", ...params.path);

    // Check if file exists
    await stat(filePath);

    // Read file
    const fileBuffer = await readFile(filePath);

    // Determine content type
    const ext = filePath.split(".").pop()?.toLowerCase();
    const contentType = ext ? `image/${ext}` : "application/octet-stream";

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=1800, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse(null, { status: 404 });
  }
}
