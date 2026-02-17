import { useWireValue } from '@forminator/react-wire'
import { Link, Outlet } from 'react-router-dom'
import { useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'

import * as store from '@/store'

export default function SettingsLayout() {
    
    const selectedTeamSlug = useWireValue(store.selectedTeamSlug)
    const selectedProjectSlug = useWireValue(store.selectedProjectSlug)
    
    const backLink = useMemo(() => {
        
        if (selectedTeamSlug && selectedProjectSlug)
            return `/t/${selectedTeamSlug}/p/${selectedProjectSlug}`
        
        if (selectedTeamSlug)
            return `/t/${selectedTeamSlug}`
        
        return '/'
        
    }, [selectedTeamSlug, selectedProjectSlug])
    
    return (
        
        <div className="min-h-screen bg-background">
            <div className="border-b border-border">
                <div className="mx-auto max-w-5xl px-6 py-4">
                    <Link
                        to={backLink}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground
                            hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to {selectedProjectSlug ? 'project' : 'team'}
                    </Link>
                </div>
            </div>
            <Outlet />
        </div>
        
    )
    
}
