export type Role =
    | "PRESIDENTE"
    | "VICE_PRESIDENTE"
    | "TESOUREIRO"
    | "VICE_TESOUREIRO"
    | "SECRETARIO"
    | "VICE_SECRETARIO"
    | "DIRETOR_ESPORTES"
    | "VICE_DIRETOR_ESPORTES"
    | "DIRETOR_CULTURA"
    | "VICE_DIRETOR_CULTURA"
    | "DIRETOR_MARKETING"
    | "VICE_DIRETOR_MARKETING"
    | "AJUDANTE"
    | "USUARIO"

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