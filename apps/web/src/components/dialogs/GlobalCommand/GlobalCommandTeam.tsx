import {
    CommandGroup,
    CommandItem,
    CommandShortcut,
} from '@/components/ui/command'
import { CreditCardIcon, SettingsIcon, UserIcon } from 'lucide-react'
import { Team } from '@repo/shared/types'

interface GlobalCommandTeamParams {
    selectedTeam: Team | null
}

const GlobalCommandTeam = ({
    selectedTeam,
}: GlobalCommandTeamParams) => {
    
    return (
        
        <CommandGroup heading="Selected Team">
            <CommandItem disabled>
                {selectedTeam?.name || 'No team selected.'}
            </CommandItem>
            <CommandItem>
                <UserIcon />
                <span>Edit Team</span>
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

export default GlobalCommandTeam
