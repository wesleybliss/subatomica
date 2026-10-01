import { Link } from 'react-router-dom'

import ThemeToggle from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'

const LandingPage = () => {

    return (

        <div id="LandingPage" className="min-h-screen bg-background text-foreground">

            <header className="border-b border-border/80 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-foreground">
                        <img
                            className="shrink-0"
                            src="/logos/v2/sub-atomica-high-resolution-logo-grayscale-transparent-v2b.png"
                            alt=""
                            width={28}
                            height={28} />
                        <span className="text-base font-semibold tracking-tight">Sub Atomica</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link to="/sign-in">
                            <Button variant="ghost" className="text-foreground">
                                Sign In
                            </Button>
                        </Link>
                        <Link to="/sign-up">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                <section className="relative overflow-hidden">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--primary)_16%,transparent),_transparent_58%)]" />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-[0.3] [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_7%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_7%,transparent)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_72%)]" />

                    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-12 sm:pb-16">
                        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight">
                                Sub Atomica
                            </h1>
                            <p className="mt-4 text-xl sm:text-2xl font-medium tracking-tight text-foreground/90">
                                Project work, kept clear.
                            </p>
                            <p className="mt-4 text-base sm:text-lg text-muted-foreground text-pretty max-w-xl">
                                Teams, boards, and tasks in one quiet workspace —
                                so shipping stays the focus.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3 animate-in fade-in duration-700 delay-150 fill-mode-both">
                                <Link to="/sign-up">
                                    <Button size="lg">Get Started</Button>
                                </Link>
                                <Link to="/sign-in">
                                    <Button size="lg" variant="outline" className="text-foreground">
                                        Sign In
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 fill-mode-both">
                        <img
                            src="/Sub-Atomica-mock.png"
                            alt="Sub Atomica kanban board"
                            className="w-full h-auto border-y border-border"
                            width={1440}
                            height={1201} />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-background to-transparent" />
                    </div>
                </section>
            </main>

        </div>

    )

}

export default LandingPage
