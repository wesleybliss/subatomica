import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'

export default async function HomePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (session) redirect('/dashboard')

    return (
        <div className="min-h-screen bg-linear-to-b from-neutral-50 to-white">
            {/* Header */}
            <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Image src="/logos/sub-atomica-high-resolution-logo-grayscale-transparent.png" alt="Sub Atomica" width={32} height={32} className="shrink-0" />
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
