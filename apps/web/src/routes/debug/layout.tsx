import { Link } from 'react-router-dom'
import { ReactNode } from 'react'

const debugLinks = [
    ['/', 'Home'],
    ['/colors', 'Colors'],
].map(([url, label]) => [`/debug${url}`, label])

interface DebugPageProps {
    children?: ReactNode
}

export default function DebugPage({
    children,
}: DebugPageProps) {
    
    return (
        
        <section className="DebugPage font-mono">
            
            <header className="flex items-center p-4 gap-8 bg-slate-200">
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
            
            {children}
        
        </section>
        
    )
    
}
