import Link from 'next/link'
import { getCurrentUser } from '@/lib/db/actions/shared'
import { getUserTeams } from '@/lib/db/actions/teams'

export default async function TeamsPage() {
    const user = await getCurrentUser()
    const teams = await getUserTeams(user.id)
    
    return (
        
        <div data-test-id="TeamsPage" className="">
            
            <header>
                <h1 className="text-2xl">Teams</h1>
            </header>
            
            <div className="mt-8">
                <ul>
                    {teams.map(team => (
                        <li key={team.id}>
                            <Link href={`/t/${team.id}`}>
                                {team.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            
        </div>
        
    )
    
}
