import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const middleware = auth(async (request) => {
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
