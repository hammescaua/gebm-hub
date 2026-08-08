import { generateToken, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, teamCode } = await request.json();
        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email & password are required or not valid" },
                { status: 400 }
            );
        }

        //Find existing user 
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 409 }
            );
        }

        let teamId: string | undefined;
        if (teamCode) {
            const team = await prisma.team.findUnique({
                where: { code: teamCode }
            })
            if (!team) {
                return NextResponse.json(
                    { error: "Please enter a valid team code" },
                    { status: 400 }
                );
            }
            teamId = team.id;
        }

        const hashedPassword = await hashPassword(password);

        // First user become ADMIN, others become USER  
        const userCount = await prisma.user.count();
        const role = userCount === 0 ? Role.PRESIDENTE : Role.USUARIO;

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                teamId
            },
            include: {
                team: true
            }
        });

        // Generate Token
        const token = generateToken(user.id)

        // Create response
        const response = NextResponse.json(
            {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    team: user.team,
                    teamId: user.teamId,
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
        console.log("Registration failed", error);
        return NextResponse.json(
            { error: "Internal server error. Something went wrong!" },
            { status: 500 }
        );
    }
}   