// @ts-expect-error @todo add types
import { createPersistedWire } from 'react-wire-persisted'
import { keys } from '@/lib/constants'
import type { StringArrayWire } from '@/types/store.types'

export const primarySidebarWidth: StringArrayWire = createPersistedWire(keys.primarySidebarWidth, [])
