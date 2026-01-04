/**
 * useTask Hook
 * Provides access to task context
 * Task: 02-063
 */

'use client'

import { useContext } from 'react'
import { TaskContext, TaskContextType } from '@/context/TaskContext'

export function useTask(): TaskContextType {
  const context = useContext(TaskContext)

  if (!context) {
    throw new Error('useTask must be used within a TaskProvider')
  }

  return context
}

export default useTask
