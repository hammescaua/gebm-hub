import { getCurrentUser } from "@/lib/auth";
import { Role } from "@/types";
import { redirect } from "next/navigation";

const DashboardLayout = async () => {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/login");
    }

    //Redirect based on user role

    switch (user.role) {
        case Role.PRESIDENTE:
        case Role.VICE_PRESIDENTE:
            redirect("/dashboard/admin");
        case Role.DIRETOR_CULTURA:
        case Role.VICE_DIRETOR_CULTURA:
        case Role.DIRETOR_ESPORTES:
        case Role.VICE_DIRETOR_ESPORTES:
        case Role.DIRETOR_MARKETING:
        case Role.VICE_DIRETOR_MARKETING:
        case Role.SECRETARIO:
        case Role.VICE_SECRETARIO:
        case Role.TESOUREIRO:
        case Role.VICE_TESOUREIRO:
            redirect("/dashboard/manager");
        case Role.AJUDANTE:
        case Role.USUARIO:
            redirect("/dashboard/user");
        default:
            redirect("/dashboard/user");
    }

    return (
        <div>
            <h1>Dashboard</h1>
        </div>
    );
};

export default DashboardLayout;