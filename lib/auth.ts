import { Role, User } from "@/types";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 12);
}

export const verifyPassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
}

export const generateToken = (userId: string) => {
    return jwt.sign(
        {
            userId
        },
        process.env.JWT_SECRET!,
        {
            expiresIn: "7d"
        }
    );
}

export const verifyToken = (token: string): { userId: string } => {
    return jwt.verify(
        token,
        process.env.JWT_SECRET!
    ) as { userId: string };
}

export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return null;

        const decode = verifyToken(token);
        const userFromDb = await prisma.user.findUnique({
            where: { id: decode.userId },
            include: { team: true }
        });

        if (!userFromDb) return null;
        const { password, ...user } = userFromDb;
        return user as unknown as User;

    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}

export { checkUserPermission, ROLE_HIERARCHY } from "./permissions";