import { createSelector, createWire } from '@forminator/react-wire'
import type { Team } from '@repo/shared/types'
import { TeamMemberProfile } from '@repo/shared/types'

export const teams = createWire<Team[]>([])

export const selectedTeamSlug = createWire<string | null>(null)

export const selectedTeam = createSelector<Team | null>({
    get: ({ get }) => get(teams)?.find(it => it.slug === get(selectedTeamSlug)) || null,
})

export const selectedTeamId = createSelector<string | null>({
    get: ({ get }) => get(selectedTeam)?.id || null,
})

export const teamMembers = createWire<TeamMemberProfile[]>([])
