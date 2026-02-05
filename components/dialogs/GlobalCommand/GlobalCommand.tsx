'use client'
import { useWireState, useWireValue } from '@forminator/react-wire'
import * as store from '@/store'
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command'
import { CalculatorIcon, CalendarIcon, CreditCardIcon, SettingsIcon, SmileIcon, UserIcon } from 'lucide-react'
import GlobalCommandTask from '@/components/dialogs/GlobalCommand/GlobalCommandTask'
import GlobalCommandTeam from '@/components/dialogs/GlobalCommand/GlobalCommandTeam'
import GlobalCommandProject from '@/components/dialogs/GlobalCommand/GlobalCommandProject'

const GlobalCommand = () => {
    
    const [globalCommandOpen, setGlobalCommandOpen] = useWireState(store.globalCommandOpen)
    
    const selectedTeam = useWireValue(store.selectedTeam)
    const selectedProject = useWireValue(store.selectedProject)
    const selectedTask = useWireValue(store.selectedTask)
    
    console.log('wtf', {
        selectedTask,
        selectedTeam,
        selectedProject,
    })
    
    return (
        
        <CommandDialog open={globalCommandOpen} onOpenChange={setGlobalCommandOpen}>
            
            <Command>
                
                <CommandInput placeholder="Type a command or search..." />
                
                <CommandList>
                    
                    <CommandEmpty>No results found.</CommandEmpty>
                    
                    <CommandGroup heading="Suggestions">
                        <CommandItem>
                            <CalendarIcon />
                            <span>Calendar</span>
                        </CommandItem>
                        <CommandItem>
                            <SmileIcon />
                            <span>Search Emoji</span>
                        </CommandItem>
                        <CommandItem>
                            <CalculatorIcon />
                            <span>Calculator</span>
                        </CommandItem>
                    </CommandGroup>
                    
                    <CommandSeparator />
                    
                    {selectedTask && <GlobalCommandTask selectedTask={selectedTask}/>}
                    {selectedTeam && <GlobalCommandTeam selectedTeam={selectedTeam} />}
                    {selectedProject && <GlobalCommandProject selectedProject={selectedProject} />}
                    
                    <CommandGroup heading="Settings">
                        <CommandItem>
                            <UserIcon />
                            <span>Profile</span>
                            <CommandShortcut>⌘P</CommandShortcut>
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
                
                </CommandList>
            
            </Command>
        
        </CommandDialog>
        
    )
    
}

export default GlobalCommand
