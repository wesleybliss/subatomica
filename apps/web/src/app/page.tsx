import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'

export default async function HomePage() {
    
    const navigate = useNavigate()
    
    const session = useSession()
    
    if (session) navigate('/dashboard', { replace: true })
    
    return (
        
        <div className="min-h-screen bg-linear-to-b from-neutral-50 to-white">
            
            {/* Header */}
            <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <image
                            className="shrink-0"
                            src="/logos/sub-atomica-high-resolution-logo-grayscale-transparent.png"
                            alt="Sub Atomica"
                            width={32}
                            height={32} />
                        <span className="text-xl font-bold">Sub Atomica</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/sign-in">
                            <Button variant="ghost">Sign In</Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>
            
            <section>
                @todo public product page and cta
            </section>
        
        </div>
        
    )
    
}
