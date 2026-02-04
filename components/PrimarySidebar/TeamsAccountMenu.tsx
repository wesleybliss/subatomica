import { ChevronDown } from 'lucide-react'

const TeamsAccountMenu = () => {
    return (
        
        <div className="p-4">
            <button
                type="button"
                className="flex items-center gap-2 w-full text-left hover:bg-sidebar-accent rounded-lg p-2 transition-colors">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">A</span>
                </div>
                <span className="text-sm font-medium text-sidebar-foreground">Acme Projects</span>
                <ChevronDown size="18" />
            </button>
        </div>
        
    )
}

export default TeamsAccountMenu
