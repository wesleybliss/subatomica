'use client'

import { useEffect, useMemo, useState } from 'react'
import { Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

type ThemeName = 'light' | 'dark' | 'system'

const ThemeToggle = ({ className }: { className?: string }) => {
    const { theme, resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => setMounted(true), [])
    
    const activeTheme = useMemo(() => {
        if (theme === 'system') return resolvedTheme ?? 'light'
        return theme ?? 'light'
    }, [theme, resolvedTheme])
    
    const icon = activeTheme === 'dark' ? Moon : Sun
    const Icon = icon
    
    if (!mounted) return null
    
    const onThemeChange = (value: ThemeName) => setTheme(value)
    
    return (
        <div className={className ?? 'fixed right-4 top-4 z-50'}>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={(
                        <Button
                            aria-label="Toggle theme"
                            variant="ghost"
                            size="icon" />
                    )}>
                    <Icon className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onThemeChange('light')}>
                        <Sun className="size-4" />
                        <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onThemeChange('dark')}>
                        <Moon className="size-4" />
                        <span>Dark</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onThemeChange('system')}>
                        <Laptop className="size-4" />
                        <span>System</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default ThemeToggle
