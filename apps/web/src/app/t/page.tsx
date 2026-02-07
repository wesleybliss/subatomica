import { useWireValue } from '@forminator/react-wire'
import { teams as storeTeams } from '@/store/teams'
import { Link } from 'react-router-dom'

export default function TeamsPage() {
    
    const teams = useWireValue(storeTeams)
    
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
