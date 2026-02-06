import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { FileSearchCorner } from 'lucide-react'

interface ListViewSearchInputProps {
    tasksQuery: string
    setTasksQuery: (value: string) => void
}

const TasksSearchInput = ({
    tasksQuery,
    setTasksQuery,
}: ListViewSearchInputProps) => {
    
    return (
        
        <InputGroup>
            
            <InputGroupAddon align="inline-start">
                <FileSearchCorner />
            </InputGroupAddon>
            
            <InputGroupInput
                id="list-view-search-input"
                value={tasksQuery}
                placeholder="Search tasks..."
                onChange={e => setTasksQuery(e.target.value)}
                onKeyUp={e => e.key === 'Escape' && setTasksQuery('')} />
        
        </InputGroup>
        
    )
    
}

export default TasksSearchInput
