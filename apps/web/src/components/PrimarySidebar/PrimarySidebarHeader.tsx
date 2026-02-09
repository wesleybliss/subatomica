import { ChevronDown, Edit, Search, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const PrimarySidebarHeader = ({ setSearchOpen }: { setSearchOpen: (item: boolean) => void }) => {
    
    return (
        
        <header className="p-4 flex items-center justify-between border-b border-neutral-700">
            
            <div className="flex items-center gap-2">
                
                <img
                    className="shrink-0"
                    src="/logos/sub-atomica-high-resolution-logo-grayscale-transparent.png"
                    alt="Sub Atomica"
                    width={24}
                    height={24} />
                
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="ghost"
                                className="font-medium text-neutral-100 hover:bg-neutral-700 hover:text-neutral-100"/>
                        }>
                        Sub Atomica
                        <ChevronDown className="ml-1 h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            
            </div>
            
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-neutral-700 hover:text-neutral-100">
                    <Edit className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-neutral-700 hover:text-neutral-100"
                    onClick={() => setSearchOpen(true)}>
                    <Search className="h-4 w-4" />
                </Button>
            </div>
        
        </header>
        
    )
    
}

export default PrimarySidebarHeader
