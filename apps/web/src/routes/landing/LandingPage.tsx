import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const LandingPage = () => {
    
    return (
        
        <div id="LandingPage" className="min-h-screen bg-linear-to-b from-neutral-50 to-white">
            
            {/* Header */}
            <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img
                            className="shrink-0"
                            src="/logos/v2/sub-atomica-high-resolution-logo-grayscale-transparent-v2b.png"
                            alt="Sub Atomica"
                            width={32}
                            height={32} />
                        <span className="text-xl font-bold">Sub Atomica</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/sign-in">
                            <Button variant="ghost">Sign In</Button>
                        </Link>
                        <Link to="/sign-up">
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

export default LandingPage
