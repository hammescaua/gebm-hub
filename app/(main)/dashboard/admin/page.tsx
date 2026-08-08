import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { checkUserPermission, getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma";
import { transformTeams, transformUsers } from "@/lib/util";
import { Role } from "@/types"
import { redirect } from "next/navigation"

const AdminPage = async () => {
    const user = await getCurrentUser();
    if (!user || !checkUserPermission(user, [Role.PRESIDENTE, Role.VICE_PRESIDENTE])) {
        redirect("/unauthorized");
    }

    // Fetch data for admin dashboard
    const [prismaUsers, prismaTeams] = await Promise.all([
        prisma.user.findMany({
            include: {
                team: true
            },
            orderBy: { createdAt: "desc" }
        }),
        prisma.team.findMany({
            include: {
                members: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        email: true
                    }
                }
            },
            orderBy: { name: "asc" }
        })
    ]);

    const users = transformUsers(prismaUsers);
    const teams = transformTeams(prismaTeams);

    return (
        <AdminDashboard
            users={users}
            teams={teams}
            currentUser={user}
        />
    );
};

export default AdminPage;