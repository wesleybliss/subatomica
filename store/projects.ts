import { createWire } from '@forminator/react-wire'
import type { Project } from '@/types'

export const projects = createWire<Project[]>([])
