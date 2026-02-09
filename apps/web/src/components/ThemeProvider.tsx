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
        document.documentElement.classList.remove('light', 'dark')
        // oxlint-disable-next-line no-restricted-globals
        document.documentElement.classList.add(theme)
        
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
