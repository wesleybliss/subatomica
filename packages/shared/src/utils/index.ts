
export const omit = <
    T extends Record<PropertyKey, unknown>,
    K extends readonly (keyof T)[]
>(obj: T, keys: K): Omit<T, K[number]> => {
    
    const result: Partial<T> = {}
    
    for (const key in obj) {
        if (!keys.includes(key))
            result[key] = obj[key]
    }
    
    return result as Omit<T, K[number]>
    
}

export const keep = <
    T extends Record<PropertyKey, unknown>,
    K extends readonly (keyof T)[]
>(obj: T, keys: K): Pick<T, K[number]> => {
    
    const result: Partial<Pick<T, K[number]>> = {}
    
    for (const key of keys) {
        if (key in obj)
            result[key] = obj[key]
    }
    
    return result as Pick<T, K[number]>
    
}
