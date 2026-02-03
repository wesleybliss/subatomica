import { createWire, type FnsWire, type StateWire } from '@forminator/react-wire'
// @ts-expect-error
import { createPersistedWire } from 'react-wire-persisted'
import { keys } from '@/lib/constants'
import { DebugToolsMode } from '@/types'
import type { StringArrayWire } from '@/types/store.types'

export const debugToolsMode = createWire<DebugToolsMode>(DebugToolsMode.minified)
