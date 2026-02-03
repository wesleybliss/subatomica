import { createWire } from '@forminator/react-wire'
import type { Team } from '@/types'

export const teams = createWire<Team[]>([])
