import type { TeamMemberProfile } from '@repo/shared/types'
import { request } from '@/lib/api/client'

export const getTeamMembers = async (teamId: string): Promise<TeamMemberProfile[]> => {
    return await request(`/api/teams/${teamId}/members`) as TeamMemberProfile[]
}
