import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { id, password } = await request.json();

    const expectedId = process.env.ACCESS_ID || "admin";
    const expectedPassword = process.env.ACCESS_PASSWORD || "admin123";

    if (id !== expectedId || password !== expectedPassword) {
      return NextResponse.json(
        { error: "Invalid Access ID or Password" },
        { status: 401 }
      );
    }

    const token = await createSessionToken(id);

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
