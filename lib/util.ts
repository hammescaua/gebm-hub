import { Team, User } from "../types";

// Simple transformation function that handles the actual Prisma response
export function transformUser(user: any): User {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        team: user.team || undefined
    };
}

export function transformUsers(users: any[]): User[] {
    return users.map(transformUser);
}

// Team transformation
export function transformTeam(team: any): Team {
    return {
        id: team.id,
        name: team.name,
        description: team.description || undefined,
        code: team.code,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        members: team.members || []
    };
}

export function transformTeams(teams: any[]): Team[] {
    return teams.map(transformTeam);
}