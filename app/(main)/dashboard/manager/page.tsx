import ManagerDashboard from "@/components/dashboard/ManagerDashboard";
import { checkUserPermission, getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma";
import { transformUsers } from "@/lib/util";
import { Role, User } from "@/types"
import { redirect } from "next/navigation"

const ManagerPage = async () => {
    const user = await getCurrentUser();
    if (!user || !checkUserPermission(user, Role.VICE_TESOUREIRO)) {
        redirect("/unauthorized");
    }

    // Fetch manager's own team members
    const prismaMyTeamMembers = user.teamId
        ? await prisma.user.findMany({
            where: {
                teamId: user.teamId,
                role: { notIn: [Role.PRESIDENTE, Role.VICE_PRESIDENTE] }
            },
            include: {
                team: true
            }
        })
        : [];

    // Fetch All team members (cross-team view - exclude sensitive fields)
    const prismaAllTeamMembers = await prisma.user.findMany({
        where: {
            role: { notIn: [Role.PRESIDENTE, Role.VICE_PRESIDENTE] }
        },
        include: {
            team: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    description: true
                }
            }
        },
        orderBy: {
            teamId: "desc"
        }
    });

    const myTeamMembers = transformUsers(prismaMyTeamMembers);
    const allTeamMembers = transformUsers(prismaAllTeamMembers);

    return (
        <ManagerDashboard
            myTeamMembers={myTeamMembers as User[]}
            allTeamMembers={allTeamMembers as User[]}
            currentUser={user}
        />
    );
};

export default ManagerPage;