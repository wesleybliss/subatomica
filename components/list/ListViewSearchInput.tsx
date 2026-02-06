import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { FileSearchCorner } from 'lucide-react'

interface ListViewSearchInputProps {
    query: string
    setQuery: (value: string) => void
}

const ListViewSearchInput = ({
    query,
    setQuery,
}: ListViewSearchInputProps) => {
    
    return (
        
        <InputGroup>
            
            <InputGroupAddon align="inline-start">
                <FileSearchCorner />
            </InputGroupAddon>
            
            <InputGroupInput
                id="list-view-search-input"
                value={query}
                placeholder="Search tasks..."
                onChange={e => setQuery(e.target.value)}
                onKeyUp={e => e.key === 'Escape' && setQuery('')} />
        
        </InputGroup>
        
    )
    
}

export default ListViewSearchInput
