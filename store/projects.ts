import { createWire } from '@forminator/react-wire'
import type { Project } from '@/types'

export const projects = createWire<Project[]>([])

export const selectedProjectId = createWire<string | null>(null)
