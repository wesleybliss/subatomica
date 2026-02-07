import { createWire/*, type FnsWire, type StateWire*/ } from '@forminator/react-wire'
/*// @ts-expect-error @todo add types
import { createPersistedWire } from 'react-wire-persisted'
import { keys } from '@/lib/constants'
import type { StringArrayWire } from '@repo/shared/types/store.types'*/
import { DebugToolsMode } from '@repo/shared/types'

export const debugToolsMode = createWire<DebugToolsMode>(DebugToolsMode.minified)
