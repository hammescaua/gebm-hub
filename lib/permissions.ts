import { Role, User } from "@/types";

/*
export const ROLE_HIERARCHY: Record<Role, number> = {
    [Role.USUARIO]: 0,
    [Role.AJUDANTE]: 1,
    [Role.VICE_DIRETOR_CULTURA]: 2,
    [Role.VICE_DIRETOR_ESPORTES]: 2,
    [Role.VICE_DIRETOR_MARKETING]: 2,
    [Role.DIRETOR_CULTURA]: 2,
    [Role.DIRETOR_ESPORTES]: 2,
    [Role.DIRETOR_MARKETING]: 2,
    [Role.SECRETARIO]: 2,
    [Role.VICE_SECRETARIO]: 2,
    [Role.TESOUREIRO]: 2,
    [Role.VICE_TESOUREIRO]: 2,
    [Role.VICE_PRESIDENTE]: 3,
    [Role.PRESIDENTE]: 3
};
*/
/*
export const checkUserPermission = (
    user: User,
    requiredRole: Role | Role[]
): boolean => {
    if (!user || !user.role) return false;

    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(user.role) || requiredRole.some(role => {
            const userRoleVal = ROLE_HIERARCHY[user.role] ?? -1;
            const reqRoleVal = ROLE_HIERARCHY[role] ?? 999;
            return userRoleVal >= reqRoleVal;
        });
    }

    const userRoleValue = ROLE_HIERARCHY[user.role] ?? -1;
    const requiredRoleValue = ROLE_HIERARCHY[requiredRole] ?? 999;

    return userRoleValue >= requiredRoleValue;
};
*/