import {
    CommandGroup,
    CommandItem,
    CommandShortcut,
} from '@/components/ui/command'
import { CreditCardIcon, SettingsIcon, UserIcon } from 'lucide-react'
import { Project } from '@repo/shared/types'
import GlobalCommandProjectViewModel from '@/components/dialogs/GlobalCommand/GlobalCommandProjectViewModel'

interface GlobalCommandProjectParams {
    selectedProject: Project | null
}

const GlobalCommandProject = ({
    selectedProject,
}: GlobalCommandProjectParams) => {
    
    const vm = GlobalCommandProjectViewModel()
    
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
            <CommandItem onSelect={vm.handleCreateTask}>
                <CreditCardIcon />
                <span>Create Task</span>
                <CommandShortcut>⌘N</CommandShortcut>
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
