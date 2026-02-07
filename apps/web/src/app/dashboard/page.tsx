import { useNavigate } from 'react-router-dom'
import { getUnixTime } from 'date-fns'
import { useMemo } from 'react'
import { useGetTeamsQuery } from '@/lib/queries/teams.queries'

export default function DashboardPage() {
    
    const navigate = useNavigate()
    
    const { isPending, error, data: teams } = useGetTeamsQuery()
    
    const lastUpdatedTeam = useMemo(() => (
        teams?.sort((a, b) => getUnixTime(a.updatedAt) - getUnixTime(b.updatedAt))?.[0]
    ), [teams])
    
    if (isPending)
        return <div>@todo loading...</div>
    
    console.log('wtf', teams, error)
    
    if (!lastUpdatedTeam)
        return (
            <div>@todo no lastUpdatedTeam</div>
        )
    
    // Redirect to the most recent team page
    setTimeout(() => navigate(`/t/${lastUpdatedTeam.id}`), 300)
    
    // @todo loader
    return (
        <div>@todo Dashboard content</div>
    )
    
}
