import { Loader2 } from 'lucide-react'
import { Outlet } from 'react-router-dom'

import { useGetTeamsQuery } from '@/lib/queries/teams.queries'

export default function TeamsLayout() {
    
    const { isPending, error } = useGetTeamsQuery()
    
    if (isPending)
        return (
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    
    if (error)
        return <div>Teams Error: {error.message}</div>
    
    return <Outlet />
    
}
