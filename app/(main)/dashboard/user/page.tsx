import UserDashboard from "@/components/dashboard/UserDashboard";
import { checkUserPermission, getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma";
import { Role, User } from "@/types"
import { redirect } from "next/navigation"

const UserPage = async () => {
    const user = await getCurrentUser();
    if (!user || !checkUserPermission(user, Role.USUARIO)) {
        redirect("/login");
    }

    // Fetch user-specific data
    const teamMembers = user.teamId
        ? await prisma.user.findMany({
            where: {
                teamId: user.teamId
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        })
        : [];

    return (
        <UserDashboard
            teamMembers={teamMembers as User[]}
            currentUser={user}
        />
    );
};

export default UserPage;