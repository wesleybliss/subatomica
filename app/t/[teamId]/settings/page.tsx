import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import SettingsAccountHeader from '@/components/settings/SettingsAccountHeader'
import { auth } from '@/lib/auth'
import { getTeamById } from '@/lib/constants'

const avatarUrlFor = (name: string, email: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`

export default async function WorkspaceSettingsPage({ params }: { params: Promise<{ teamId: string }> }) {
    
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    
    if (!session) redirect('/sign-in')
    
    const { teamId } = await params
    const team = getTeamById(teamId)
    
    if (!team) redirect('/')
    
    const name = session.user?.name || session.user?.email || 'User'
    const email = session.user?.email || ''
    const avatarUrl = session.user?.image || avatarUrlFor(name, email)
    
    return (
        
        <div className="flex-1 overflow-y-auto bg-neutral-50">
            
            <div className="border-b border-neutral-200 bg-white/80 backdrop-blur">
                <div className="mx-auto max-w-5xl px-6 py-10">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Team Settings</p>
                            <h1 className="text-3xl font-semibold text-neutral-900 mt-2">{team.name}</h1>
                            <p className="text-sm text-neutral-500 mt-2">
                                Manage account access and settings for this team.
                            </p>
                        </div>
                        <div className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs text-neutral-500">
                            Last updated today
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
                
                <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <div className="border-b border-neutral-100 px-6 py-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Account</p>
                    </div>
                    <SettingsAccountHeader name={name} email={email} avatarUrl={avatarUrl} />
                </section>
                
                <section>TODO</section>
                
            </div>
            
        </div>
        
    )
    
}
