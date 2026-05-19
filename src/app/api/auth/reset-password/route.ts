import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcryptjs from "bcryptjs";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsedData = resetPasswordSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: parsedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = parsedData.data;

    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    if (new Date() > new Date(resetToken.expires)) {
      await db.passwordResetToken.delete({
        where: { token },
      }).catch((err) => console.error("Failed to delete expired token:", err));

      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcryptjs.hash(password, 12);

    await db.$transaction([
      db.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      }),
      db.passwordResetToken.delete({
        where: { token },
      }),
    ]);

    return NextResponse.json(
      { message: "Password reset successfully. You can now log in with your new password." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
