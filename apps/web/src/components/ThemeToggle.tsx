import { Laptop, Moon, Sun } from 'lucide-react'
import { useSyncExternalStore } from 'react'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/components/useTheme'

type ThemeName = 'light' | 'dark' | 'system'

const subscribe = () => () => {}

const ThemeToggle = ({ className }: { className?: string }) => {
    const { theme, setTheme } = useTheme()
    const mounted = useSyncExternalStore(subscribe, () => true, () => false)
    
    const Icon = theme === 'dark' ? Moon : Sun
    
    if (!mounted) return null
    
    const onThemeChange = (value: ThemeName) => setTheme(value)
    
    return (
        <div className={className}>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={(
                        <Button
                            aria-label="Toggle theme"
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground" />
                    )}>
                    <Icon className="size-4" strokeWidth={1.75} />
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
