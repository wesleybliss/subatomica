import type { Team } from '@repo/shared/types'
import { TeamMemberProfile } from '@repo/shared/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { getStoreName } from '@/lib/constants'
import { createSetterFns } from '@/lib/utils/store.utils'

interface TeamStore {
    teams: Team[]
    setTeams: (value: Team[]) => void
    selectedTeamSlug: string | null
    setSelectedTeamSlug: (value: string | null) => void
    teamMembers: TeamMemberProfile[]
    setTeamMembers: (value: TeamMemberProfile[]) => void
}

const initialValues = {
    teams: [],
    selectedTeamSlug: null,
    teamMembers: [],
} satisfies Partial<TeamStore>

export const useTeamStore = create<TeamStore>()(
    persist(
        set => ({
            ...initialValues,
            ...createSetterFns<TeamStore>()(set, initialValues),
        }),
        {
            name: getStoreName('project'),
            partialize: state => ({
                selectedTeamSlug: state.selectedTeamSlug,
            }),
        },
    ),
)

export const useSelectedTeam = () =>
    useTeamStore(state =>
        state.teams.find(it => it.slug === state.selectedTeamSlug) ?? null,
    )

export const useSelectedTeamId = () => useSelectedTeam()?.id
