import {
    CommandGroup,
    CommandItem,
    CommandShortcut,
} from '@/components/ui/command'
import { CreditCardIcon, SettingsIcon, UserIcon } from 'lucide-react'
import { Task } from '@repo/shared/types'

interface GlobalCommandTaskParams {
    selectedTask: Task | null
}

const GlobalCommandTask = ({
    selectedTask,
}: GlobalCommandTaskParams) => {
    
    return (
        
        <CommandGroup heading="Selected Task">
            <CommandItem disabled>
                {selectedTask?.title || 'No task selected.'}
            </CommandItem>
            <CommandItem>
                <UserIcon />
                <span>Edit Task</span>
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

export default GlobalCommandTask
