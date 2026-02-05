// @ts-expect-error @todo add types
import { createPersistedWire } from 'react-wire-persisted'
import { createWire } from '@forminator/react-wire'
import { keys } from '@/lib/constants'
import type { TaskLane } from '@/types'

export const lanes = createWire<TaskLane[]>([])

export const collapsedLanes = createPersistedWire<string[]>(keys.collapsedLanes, [])
