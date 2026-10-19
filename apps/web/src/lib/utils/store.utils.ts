import { StoreActionBase, StoreSetter } from '@repo/shared/types'

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
): (value: StoreActionBase<T[K]>) => void => {
    
    return value => {
        
        if (isStoreSetter(value)) {
            set(state => {
                const partial: Partial<T> = {}
                partial[key] = value(state[key])
                return partial
            })
        } else {
            const partial: Partial<T> = {}
            partial[key] = value
            set(partial)
        }
        
    }
    
}

export const createSetterFns = <T extends object>() => <K extends keyof T>(
    set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
    initialValues: Partial<T>,
): {
    [P in K as `set${Capitalize<string & P>}`]: (value: StoreActionBase<T[P]>) => void
} => {
    
    const keys = getStoreKeys(initialValues)
    
    const setters = {} as {
        [P in K as `set${Capitalize<string & P>}`]: (value: StoreActionBase<T[P]>) => void
    }
    
    for (const key of keys) {
        const firstLetter = String(key).charAt(0).toUpperCase()
        const setterName = `set${firstLetter}${String(key).slice(1)}` as `set${Capitalize<string & K>}`
        Object.assign(setters, { [setterName]: createSetterFn<T>()(set, key) })
    }
    
    return setters
    
}
