import { createSelector, createWire } from '@forminator/react-wire'
import type { Team } from '@/types'

export const teams = createWire<Team[]>([])

export const selectedTeamId = createWire<string | null>(null)

export const selectedTeam = createSelector<Team | null>({
    get: ({ get }) => get(teams)?.find(it => it.id === get(selectedTeamId)) || null,
})
