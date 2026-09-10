import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function middleware(request: NextRequest) {
  // This cookie is a navigation hint only. The Go server validates the session on every protected API.
  if (!request.cookies.get("user_id")) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}
export const config = { matcher: ["/", "/groups/:path*", "/chat/:path*", "/profile/:path*", "/settings/:path*", "/notifications/:path*"] };
