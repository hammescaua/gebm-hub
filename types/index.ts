export const Role = {
    PRESIDENTE: "PRESIDENTE",
    VICE_PRESIDENTE: "VICE_PRESIDENTE",
    TESOUREIRO: "TESOUREIRO",
    VICE_TESOUREIRO: "VICE_TESOUREIRO",
    SECRETARIO: "SECRETARIO",
    VICE_SECRETARIO: "VICE_SECRETARIO",
    DIRETOR_ESPORTES: "DIRETOR_ESPORTES",
    VICE_DIRETOR_ESPORTES: "VICE_DIRETOR_ESPORTES",
    DIRETOR_CULTURA: "DIRETOR_CULTURA",
    VICE_DIRETOR_CULTURA: "VICE_DIRETOR_CULTURA",
    DIRETOR_MARKETING: "DIRETOR_MARKETING",
    VICE_DIRETOR_MARKETING: "VICE_DIRETOR_MARKETING",
    AJUDANTE: "AJUDANTE",
    USUARIO: "USUARIO",
} as const

export type Role = (typeof Role)[keyof typeof Role]

export interface User {
    id: string
    name: string
    email: string
    role: Role
    teamId?: string
    team?: Team
    createdAt: Date
    updatedAt: Date
}

export interface Team {
    id: string
    name: string
    description?: string | null
    code: string
    members: User[]
    createdAt: Date
    updatedAt: Date
}

export interface AuthContextType {
    user: User | null
    login: (formData: FormData) => void
    logout: () => void
    hasPermission: (requiredRole: Role) => boolean
}