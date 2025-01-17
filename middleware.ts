import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { join } from "path";
import { stat, readFile } from "fs/promises";

export async function middleware(request: NextRequest) {
  // Handle uploads
  if (request.nextUrl.pathname.startsWith("/uploads/")) {
    try {
      const filePath = join(process.cwd(), "public", request.nextUrl.pathname);

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
      return NextResponse.next();
    }
  }

  // Handle auth for admin routes
  if (request.nextUrl.pathname.startsWith("/admin/")) {
    return auth();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/uploads/:path*"],
};
