import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({
        status: 200,
        message: "Logged out successfully"
    });

    response.cookies.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        sameSite: "lax"
    });

    return response;
}