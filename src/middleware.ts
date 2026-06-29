import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "nunew_access_token";
const PROTECTED_PREFIXES = ["/mypage", "/profile/init", "/profile/setting"];

const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export const middleware = async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  const hasAccessToken = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (isProtectedPath(pathname) && !hasAccessToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/auth/login") && hasAccessToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
