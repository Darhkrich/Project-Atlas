import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const parts = host.split(".");
  const isLocalhost = host.includes("localhost");

  // Skip static assets and API routes
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Development: sub.localhost:3000
  if (isLocalhost) {
    if (parts.length >= 2 && parts[0] !== "www" && parts[0] !== "localhost") {
      const subdomain = parts[0];
      const url = req.nextUrl.clone();
      url.pathname = `/store/${subdomain}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  } else {
    // Production: subdomain.atlas.com
    if (parts.length >= 3 && parts[0] !== "www") {
      const subdomain = parts[0];
      const url = req.nextUrl.clone();
      url.pathname = `/store/${subdomain}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};