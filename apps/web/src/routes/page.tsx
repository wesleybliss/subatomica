import { getUnixTime } from 'date-fns'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useSession } from '@/lib/auth-client'
import { useGetTeamsQuery } from '@/lib/queries/teams.queries'

export default function HomePage() {
    
    const navigate = useNavigate()
    const session = useSession()
    
    const { isPending, error, data: teams } = useGetTeamsQuery({
        enabled: !!session,
    })
    
    const lastUpdatedTeam = useMemo(() => (
        teams?.sort((a, b) => getUnixTime(a.updatedAt) - getUnixTime(b.updatedAt))?.[0]
    ), [teams])
    
    if (!session) {
        navigate('/sign-in', { replace: true })
        return null
    }
    
    if (isPending)
        return <div>@todo HomePage loading...</div>
    
    if (error)
        return <div>@todo HomePage error {error.message}</div>
    
    if (!lastUpdatedTeam) {
        navigate('/sign-in', { replace: true })
        return (
            <div>@todo no lastUpdatedTeam</div>
        )
    }
    
    // Redirect to the most recent team page
    setTimeout(() => navigate(`/t/${lastUpdatedTeam.slug}`), 300)
    
    // @todo loader
    return (
        <div>@todo Dashboard content</div>
    )
    
}
