import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { loginRateLimit } from "@/lib/rate-limiter";

const handler = NextAuth(authOptions);

export async function GET(req: NextRequest, ctx: { params: { nextauth: string[] } }) {
  try {
    return await handler(req, ctx);
  } catch (error) {
    console.error("NextAuth GET error:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export async function POST(req: NextRequest, ctx: { params: { nextauth: string[] } }) {
  try {
    const url = new URL(req.url);
    if (url.pathname.includes("/callback/credentials")) {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";

      const { success } = await loginRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many login attempts. Please try again in 10 minutes." },
          { status: 429 }
        );
      }
    }
    return await handler(req, ctx);
  } catch (error) {
    console.error("NextAuth POST error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
