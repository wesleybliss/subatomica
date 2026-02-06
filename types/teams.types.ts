export type Team = {
    id: string
    createdAt: string
    updatedAt: string
    ownerId: string
    name: string
}

export type TeamMemberProfile = {
    id: string
    name: string
    email: string
    image: string | null
    role: string
}
