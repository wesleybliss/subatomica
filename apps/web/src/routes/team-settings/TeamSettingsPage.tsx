import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { MembersSection } from '@/components/team-settings/MembersSection'
import SettingsAccountHeader from '@/components/team-settings/SettingsAccountHeader'
import { TrelloImportSection } from '@/components/team-settings/TrelloImportSection'
import { useSession } from '@/lib/auth-client'
import { useTeamStore } from '@/store'

const avatarUrlFor = (name: string, email: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`

export default function TeamSettingsPage() {
    
    const params = useParams()
    const { data: session } = useSession()
    
    const teamSlug = params.teamSlug
    
    const teams = useTeamStore(s => s.teams)
    const members = useTeamStore(s => s.teamMembers)
    
    // @todo !!!!! need to figure this out
    const canManage = true
    
    const team = useMemo(() => (
        teams?.find(it => it.slug === teamSlug)
    ), [teams, teamSlug])
    
    if (!session) return <Navigate to="/sign-in" replace />
    
    if (!teamSlug || !team) return <Navigate to="/" replace />
    
    // @todo check canManageTeamMembers(teamId),
    
    const name = session.user?.name || session.user?.email || 'User'
    const email = session.user?.email || ''
    const avatarUrl = session.user?.image || avatarUrlFor(name, email)
    
    return (
        
        <div className="flex-1 overflow-y-auto">
            
            <div className="border-b border-neutral-200 backdrop-blur">
                <div className="mx-auto max-w-5xl px-6 py-10">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Team Settings</p>
                            <h1 className="text-3xl font-semibold text-neutral-900 mt-2">{team.name}</h1>
                            <p className="text-sm text-neutral-500 mt-2">
                                Manage account access and settings for this team.
                            </p>
                        </div>
                        <div className="rounded-full border border-neutral-200
                           px-4 py-2 text-xs text-neutral-500">
                            Last updated today
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
                
                <section className="rounded-2xl border border-neutral-200 shadow-sm">
                    <div className="border-b border-neutral-100 px-6 py-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                            Account
                        </p>
                    </div>
                    <SettingsAccountHeader name={name} email={email} avatarUrl={avatarUrl} />
                </section>
                
                <MembersSection teamId={team.id} members={members} canManage={canManage} />
                
                <TrelloImportSection
                    teamId={team.id}
                    teamSlug={team.slug}
                    teamName={team.name}
                />
            
            </div>
        
        </div>
        
    )
    
}
