import { useWireValue } from '@forminator/react-wire'
import * as store from '@/store'
import { useNavigate } from 'react-router-dom'
import { getUnixTime } from 'date-fns'

export default function DashboardPage() {
    
    const navigate = useNavigate()
    
    const teams = useWireValue(store.teams)
    
    const lastUpdatedTeam = teams.sort((a, b) => getUnixTime(a.updatedAt) - getUnixTime(b.updatedAt))?.[0]
    
    if (!lastUpdatedTeam)
        return (
            <div>@todo no lastUpdatedTeam</div>
        )
    
    // Redirect to the most recent team page
    navigate(`/t/${lastUpdatedTeam.id}`)
    
    // @todo loader
    return (
        <div>@todo Dashboard content</div>
    )
    
}
