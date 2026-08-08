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
        const user = await getCurrentUser();

        if (!user || !checkUserPermission(user, [Role.PRESIDENTE, Role.VICE_PRESIDENTE])) {
            return NextResponse.json(
                { error: "You are not authorized to assign team" },
                { status: 401 }
            );
        }

        const { teamId } = await request.json();

        if (teamId) {
            const team = await prisma.team.findUnique({
                where: { id: teamId }
            })
            if (!team) {
                return NextResponse.json(
                    { error: "Team not found" },
                    { status: 404 }
                );
            }
        }

        // Update user's team assignment
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { teamId: teamId },
            include: { team: true }
        });

        return NextResponse.json({
            user: updatedUser,
            message: teamId ? "User assigned to team successfully" : "User removed from team successfully"
        })

    } catch (error) {
        console.log("Team assignment error: ", error);
        if (error instanceof Error && error.message.includes("Record to update not found")) {
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