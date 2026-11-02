import { Link, Outlet } from 'react-router-dom'

const debugLinks = [
    ['/', 'Home'],
    ['/colors', 'Colors'],
].map(([url, label]) => [`/debug${url}`, label])

export default function DebugLayout() {
    
    return (
        
        <section className="DebugLayout w-full h-screen font-mono">
            
            <header className="flex items-center p-4 gap-8">
                <h1 className="text-xl">Debug</h1>
                <ul className="flex items-center">
                    {debugLinks.map(([url, label]) => (
                        <li key={url} className="mr-4">
                            <Link className="text-sm" to={url}>
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </header>
            
            <Outlet />
        
        </section>
        
    )
    
}
