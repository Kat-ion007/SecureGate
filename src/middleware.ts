import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const emailVerified = token?.emailVerified;

    if (!emailVerified) {
      return NextResponse.redirect(new URL("/verify-pending", req.url));
    }
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"],
};
