import { createWire } from '@forminator/react-wire'
import type { TaskLane } from '@repo/shared/types'
// @ts-expect-error react-wire-persisted has no types
import { createPersistedWire } from 'react-wire-persisted'

import { keys } from '@/lib/constants'

export const lanes = createWire<TaskLane[]>([])

export const collapsedLanes = createPersistedWire<string[]>(keys.collapsedLanes, [])
