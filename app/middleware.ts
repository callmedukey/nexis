import { auth } from "@/auth";

export default auth((req) => {
  return null;
});

export const config = {
  matcher: ["/admin/:path*"],
};
