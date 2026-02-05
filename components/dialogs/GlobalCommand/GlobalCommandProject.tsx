'use client'
import {
    CommandGroup,
    CommandItem,
    CommandShortcut,
} from '@/components/ui/command'
import { CreditCardIcon, SettingsIcon, UserIcon } from 'lucide-react'
import { Project } from '@/types'

interface GlobalCommandProjectParams {
    selectedProject: Project | null
}

const GlobalCommandProject = ({
    selectedProject,
}: GlobalCommandProjectParams) => {
    
    return (
        
        <CommandGroup heading="Selected Project">
            <CommandItem disabled>
                {selectedProject?.name || 'No project selected.'}
            </CommandItem>
            <CommandItem>
                <UserIcon />
                <span>Edit Project</span>
                <CommandShortcut>⌘E</CommandShortcut>
            </CommandItem>
            <CommandItem>
                <CreditCardIcon />
                <span>Billing</span>
                <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
                <SettingsIcon />
                <span>Settings</span>
                <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
        </CommandGroup>
        
    )
    
}

export default GlobalCommandProject
