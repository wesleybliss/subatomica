import { createWire } from '@forminator/react-wire'
import { mockTasks } from '@/lib/constants'
import type { Task } from '@/types'

export const tasks = createWire<Task[]>([...mockTasks])

export const selectedTask = createWire<Task | null>(null)
