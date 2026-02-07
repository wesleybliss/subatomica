import { useGetTeamsQuery } from '@/lib/queries/teams.queries'
import { Outlet } from 'react-router-dom'

export default function TeamsLayout() {
    
    const { isPending, error } = useGetTeamsQuery()
    
    if (isPending)
        return <div>Loading teams...</div>
    
    if (error)
        return <div>Teams Error: {error.message}</div>
    
    return <Outlet />
    
}
