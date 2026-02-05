'use client'
import logger from '@/lib/logger'
import { useEffect } from 'react'
import { Defined, useWire, type Wire } from '@forminator/react-wire'
import * as store from '@/store'

const log = logger('StoreWriterClient')

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
    
    log.d('Initialized with', { storeKey, data })
    
    // @ts-expect-error Wire is looked up dynamically
    const storeWire = useWire<T>(store[storeKey] as Wire<T>)
    
    useEffect(() => {
        
        if (!data && !allowFalsey) return log.w('invoked with falsey data')
        
        log.d('invoked with data', data)
        storeWire.setValue(data as Defined<T>)
        
    }, [storeKey, data])
    
    return null
    
}

export default StoreWriterClient
