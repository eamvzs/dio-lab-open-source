import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedRoutes = ["/setup", "/interview", "/feedback", "/dashboard"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
