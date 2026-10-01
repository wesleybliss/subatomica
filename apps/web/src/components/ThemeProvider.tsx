import { createContext, ReactNode,useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
    children: ReactNode
    defaultTheme?: Theme
}

const ThemeProvider = ({ children, defaultTheme = 'dark' }: ThemeProviderProps) => {
    
    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = localStorage.getItem('theme') as Theme | null
        return stored || defaultTheme
    })
    
    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
        localStorage.setItem('theme', newTheme)
    }
    
    useEffect(() => {
        // oxlint-disable-next-line no-restricted-globals
        const root = document.documentElement
        
        // Keep theme on <html> only — a data-theme on <body> would
        // re-declare CSS variables and fight the active theme.
        // oxlint-disable-next-line no-restricted-globals
        document.body.removeAttribute('data-theme')

        if (theme === 'system') {
            // oxlint-disable-next-line no-restricted-globals
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            const systemTheme = mediaQuery.matches ? 'dark' : 'light'
            root.setAttribute('data-theme', systemTheme)
            
            const handleChange = (e: MediaQueryListEvent) => {
                root.setAttribute('data-theme', e.matches ? 'dark' : 'light')
            }
            
            mediaQuery.addEventListener('change', handleChange)
            return () => mediaQuery.removeEventListener('change', handleChange)
        } else {
            root.setAttribute('data-theme', theme)
        }
    }, [theme])
    
    return (
        
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
        
    )
    
}

export const useTheme = () => {
    
    const context = useContext(ThemeContext)
    
    if (!context)
        throw new Error('useTheme must be used within ThemeProvider')
    
    return context
    
}

export default ThemeProvider
