import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getDefaultTeamId } from '@/lib/constants'

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) redirect('/sign-in')

    // Redirect to team page
    redirect(`/t/${getDefaultTeamId()}`)

    return (
        <div>@todo Dashboard content</div>
    )
}
