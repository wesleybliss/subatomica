import { useEffect, useState } from 'react'

export const useDebounce = <T,>(
    value: T,
    delay = 300,
    callback?: (debouncedValue: T) => void,
) => {
    
    const [debouncedValue, setDebouncedValue] = useState(value)
    
    useEffect(() => {
        
        const t = setTimeout(() => setDebouncedValue(value), delay)
        
        return () => {
            clearTimeout(t)
        }
        
    }, [value, delay])
    
    callback?.(debouncedValue)
    
    return debouncedValue
    
}

/*const Example = () => {
    
    const [value, setValue] = useState('')
    const debouncedValue = useDebounce(value, 300)
    
    return (
        
        <input
            value={value}
            onChange={e => setValue(e.target.value)} />
        
    )
}*/

export default useDebounce
