import { Defined, useWire, type Wire } from '@forminator/react-wire'
import { useEffect } from 'react'

import * as store from '@/store'

interface StoreWriterClientProps<T> {
    storeKey: string
    data: T | null
    allowFalsey?: boolean
}

const StoreWriterClient = <T,>({
    storeKey,
    data,
    allowFalsey = false,
}: StoreWriterClientProps<T>) => {
    
    // @ts-expect-error Wire is looked up dynamically
    const storeWire = useWire<T>(store[storeKey] as Wire<T>)
    
    useEffect(() => {
        
        if (!data && !allowFalsey) return
        
        storeWire.setValue(data as Defined<T>)
        
    }, [storeKey, data])
    
    return null
    
}

export default StoreWriterClient
