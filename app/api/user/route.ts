import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "You are not authorized to access user information" },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const teamId = searchParams.get("teamId");
        const role = searchParams.get("role");

        // Build where clause based on user role
        const where: Prisma.UserWhereInput = {};
        if (user.role === Role.PRESIDENTE || user.role === Role.VICE_PRESIDENTE) {
            // Presidente ou vice-presidente can see all users
        } else if (user.role === Role.TESOUREIRO) {
            // Tesoureiro can see users in their team or regular users
            where.OR = [{ teamId: user.teamId }, { role: Role.USUARIO }];
        } else {
            // Regular user can only see in their team (excluding president / vice-president)
            where.teamId = user.teamId;
            where.role = { notIn: [Role.PRESIDENTE, Role.VICE_PRESIDENTE] };
        }

        //Additional filters
        if (teamId) {
            where.teamId = teamId;
        }
        if (role) {
            where.role = role as Role;
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                team: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ users });

    }
    catch (error) {
        console.error("Get users error: ", error);
        return NextResponse.json(
            { error: "Internal server error. Something went wrong!" },
            { status: 500 }
        );
    }
}


