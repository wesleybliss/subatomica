
export type StoreSetter<T> = (prev: T) => T
export type StoreActionBase<T> = T | StoreSetter<T>
export type StoreAction<T> = (value: StoreActionBase<T>) => void
