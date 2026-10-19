import { Link } from 'react-router-dom'

import { useTeamStore } from '@/store'

export default function TeamsPage() {
    
    const teams = useTeamStore(s => s.teams)
    
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
