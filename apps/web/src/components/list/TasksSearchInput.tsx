import { FileSearchCorner } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import useDebounce from '@/hooks/useDebounce'

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
    
    useEffect(() => {
        lastEmittedValue.current = tasksQuery
        setInputValue(tasksQuery)
    }, [tasksQuery])
    
    useEffect(() => {
        if (debouncedValue !== lastEmittedValue.current) {
            lastEmittedValue.current = debouncedValue
            setTasksQuery(debouncedValue)
        }
    }, [debouncedValue, setTasksQuery])
    
    return (
        
        <InputGroup>
            
            <InputGroupAddon align="inline-start">
                <FileSearchCorner />
            </InputGroupAddon>
            
            <InputGroupInput
                id="list-view-search-input"
                value={inputValue}
                placeholder="Search tasks..."
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Escape') {
                        setInputValue('')
                        setTasksQuery('')
                    }
                }} />
        
        </InputGroup>
        
    )
    
}

export default TasksSearchInput
