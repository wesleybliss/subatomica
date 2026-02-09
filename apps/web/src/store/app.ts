// @ts-expect-error @todo add types
import { createWire } from '@forminator/react-wire'
import type { StringArrayWire } from '@repo/shared/types/store.types'
import { createPersistedWire } from 'react-wire-persisted'

import { keys } from '@/lib/constants'

export const primarySidebarWidth: StringArrayWire = createPersistedWire(keys.primarySidebarWidth, [])
export const primarySidebarCollapsed = createWire<boolean>(false)
