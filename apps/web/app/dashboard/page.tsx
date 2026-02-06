import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getTeamByLastUpdated } from '@/lib/db/actions'

export default async function DashboardPage() {
    
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    
    if (!session) redirect('/sign-in')
    
    const lastUpdatedTeam = await getTeamByLastUpdated()
    
    // Redirect to the most recent team page
    redirect(`/t/${lastUpdatedTeam.id}`)
    
    // @todo loader
    return (
        <div>@todo Dashboard content</div>
    )
}
