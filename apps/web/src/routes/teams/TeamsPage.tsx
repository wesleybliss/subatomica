import { useWireValue } from '@forminator/react-wire'
import { Link } from 'react-router-dom'

import { teams as storeTeams } from '@/store/teams'

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
                            <Link to={`/t/${team.id}`}>
                                {team.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        
        </div>
        
    )
    
}
