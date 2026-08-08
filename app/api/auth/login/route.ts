import { generateToken, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email & password are required or not valid" },
                { status: 400 }
            );
        }

        //Find existing user 
        const userFromDb = await prisma.user.findUnique({
            where: { email },
            include: { team: true }
        });

        if (!userFromDb) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const isValidPassword = await verifyPassword(password, userFromDb.password);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Invalid password" },
                { status: 401 }
            );
        }

        // Generate Token
        const token = generateToken(userFromDb.id)

        // Create response
        const response = NextResponse.json(
            {
                user: {
                    id: userFromDb.id,
                    name: userFromDb.name,
                    email: userFromDb.email,
                    role: userFromDb.role,
                    team: userFromDb.team,
                    teamId: userFromDb.teamId,
                    token
                }
            }
        );

        // Set cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7,
            sameSite: "lax"
        });

        return response;
    } catch (error) {
        console.log("Login failed", error);
        return NextResponse.json(
            { error: "Internal server error. Something went wrong!" },
            { status: 500 }
        );
    }
}   