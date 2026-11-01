import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import useDebounce from '@/hooks/useDebounce'
import { KEYBOARD_SYMBOLS } from '@/lib/constants/icons.constants'
import { cn } from '@/lib/utils'

import { Kbd, KbdGroup } from '../ui/kbd'

interface ListViewSearchInputProps {
    tasksQuery: string
    setTasksQuery: (value: string) => void
}

const TasksSearchInput = ({
    tasksQuery,
    setTasksQuery,
}: ListViewSearchInputProps) => {
    
    const [inputValue, setInputValue] = useState(tasksQuery)
    const debouncedValue = useDebounce(inputValue, 250)
    const lastEmittedValue = useRef(tasksQuery)
    const [prevTasksQuery, setPrevTasksQuery] = useState(tasksQuery)
    const [isExpanded, setIsExpanded] = useState(false)
    
    if (tasksQuery !== prevTasksQuery) {
        setPrevTasksQuery(tasksQuery)
        setInputValue(tasksQuery)
    }
    
    useEffect(() => {
        lastEmittedValue.current = tasksQuery
    }, [tasksQuery])
    
    useEffect(() => {
        if (debouncedValue !== lastEmittedValue.current) {
            lastEmittedValue.current = debouncedValue
            setTasksQuery(debouncedValue)
        }
    }, [debouncedValue, setTasksQuery])
    
    return (
        <InputGroup className={cn('max-w-160 ml-auto bg-muted/40 shadow-none',
            'has-[[data-slot=input-group-control]:focus-visible]:ring-0!',
            'has-[[data-slot=input-group-control]:focus-visible]:border-primary/10', {
                'ml-auto w-min!': !isExpanded,
            })}>
            <InputGroupAddon align="inline-start">
                <Search className="size-4" strokeWidth={1.75} />
            </InputGroupAddon>
            <InputGroupInput
                id="list-view-search-input"
                className={cn('transition-all ease-in-out duration-300', {
                    'w-0 opacity-0': !isExpanded,
                })}
                value={inputValue}
                placeholder="Search tasks..."
                onBlur={() => setIsExpanded(false)}
                onFocus={() => setIsExpanded(true)}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Escape') {
                        setInputValue('')
                        setTasksQuery('')
                        setIsExpanded(false)
                    }
                }} />
            <InputGroupAddon align="inline-end">
                <KbdGroup>
                    <Kbd>{KEYBOARD_SYMBOLS.Command}/</Kbd>
                </KbdGroup>
            </InputGroupAddon>
        </InputGroup>
    )
    
}

export default TasksSearchInput
