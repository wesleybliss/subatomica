import { StoreAction, StoreActionBase, StoreSetter } from '@repo/shared/types'

const isStoreSetter = <T>(
    value: StoreActionBase<T>,
): value is StoreSetter<T> => {
    
    return typeof value === 'function'
    
}

export const getStoreKeys = <T extends object>(value: T) =>
    Object.keys(value) as (keyof T)[]

/**
 * Creates a setter with full type safety
 * 
 * @example
 * import { createSetterFn } from '@/lib/utils/store.utils'
 * interface AppStore { ... }
 * const createSetter = createSetterFn<AppStore>()
 * setPrimarySidebarWidth: createSetter(set, 'primarySidebarWidth'),
 */
export const createSetterFn = <T extends object>() => <K extends keyof T>(
    set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
    key: K,
): StoreAction<T[K]> => {
    return value => {
        set(state => {
            const partial: Partial<T> = {}
            
            partial[key] = isStoreSetter(value)
                ? value(state[key])
                : value
            
            return partial
        })
    }
}

export const createSetterFns = <T extends object>() => <K extends keyof T>(
    set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
    initialValues: Pick<T, K>,
): {
    [P in K as `set${Capitalize<string & P>}`]: StoreAction<T[P]>
} => {
    const keys = getStoreKeys(initialValues)
    
    const setters = {} as {
        [P in K as `set${Capitalize<string & P>}`]: StoreAction<T[P]>
    }
    
    for (const key of keys) {
        const setterName = `set${String(key).charAt(0).toUpperCase()}${String(key).slice(1)}` as `set${Capitalize<string & K>}`
        
        Object.assign(setters, {
            [setterName]: createSetterFn<T>()(set, key),
        })
    }
    
    return setters
}
