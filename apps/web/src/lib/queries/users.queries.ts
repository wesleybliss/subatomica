import type { InviteCodeResponse } from '@repo/shared/types'
import Logger from '@repo/shared/utils/logger'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { request } from '@/lib/api/client'

const log = new Logger('web/lib/queries/users.queries')

export const useGetInviteCodeQuery = () => {
    
    const inviteCodeQueryKey = useMemo(() => (
        ['inviteCode'] as const
    ), [])
    
    const query = useQuery<string | null, Error>({
        queryKey: inviteCodeQueryKey,
        queryFn: async () => {
            try {
                const url = '/users/invite-code'
                const res = await request<InviteCodeResponse>(url)
                return res?.inviteCode || null
            } catch (e) {
                log.e('useGetInviteCodeQuery', e)
                return null
            }
        },
    })
    
    return {
        ...query,
        inviteCodeQueryKey,
    }
    
}
