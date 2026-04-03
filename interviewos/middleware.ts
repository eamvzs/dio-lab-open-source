import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/setup", "/interview", "/feedback", "/dashboard"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    // Check for session token (NextAuth sets this cookie)
    const sessionToken =
      req.cookies.get("authjs.session-token") ||
      req.cookies.get("next-auth.session-token") ||
      req.cookies.get("__Secure-authjs.session-token") ||
      req.cookies.get("__Secure-next-auth.session-token");

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
