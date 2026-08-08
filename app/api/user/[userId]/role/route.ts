import { checkUserPermission, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await context.params;
        const currentUser = await getCurrentUser();

        if (!currentUser || !checkUserPermission(currentUser, [Role.PRESIDENTE, Role.VICE_PRESIDENTE])) {
            return NextResponse.json(
                { error: "You are not authorized to assign team" },
                { status: 401 }
            );
        }

        // Prevent users from changing their own role
        if (userId === currentUser.id) {
            return NextResponse.json(
                { error: "You cannot change your own role" },
                { status: 401 }
            );
        }

        const { role } = await request.json();

        // Validate role
        const validRoles = Object.values(Role);
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { error: "Invalid role" },
                { status: 404 }
            );
        }

        // Update user's team assignment
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role },
            include: { team: true }
        });

        return NextResponse.json({
            user: updatedUser,
            message: `User role updated to ${role} successfully`
        })

    } catch (error) {
        console.log("Role assignment error: ", error);
        if (
            error instanceof Error &&
            error.message.includes("Record to update not found")
        ) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Internal server error. Something went wrong!" },
            { status: 500 }
        );
    }
}