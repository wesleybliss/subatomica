import { mockTeams } from '@/lib/constants'
import Link from 'next/link'

export default function TeamsPage() {
    
    return (
        
        <div data-test-id="TeamsPage" className="">
            
            <header>
                <h1 className="text-2xl">Teams</h1>
            </header>
            
            <div className="mt-8">
                <ul>
                    {mockTeams.map(team => (
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
