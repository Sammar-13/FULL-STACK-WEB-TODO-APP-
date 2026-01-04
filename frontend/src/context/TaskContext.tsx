/**
 * Task Context
 * Manages task state and provides task operations
 * Task: 02-060
 */

'use client'

import React, { createContext, useCallback, useState, useEffect } from 'react'
import tasksService from '@/services/tasks'
import { useAuth } from '@/hooks/useAuth'
import {
  Task,
  TaskState,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterOptions,
  TaskStatus,
  TaskPriority,
  ApiError,
} from '@/types'

export interface TaskContextType extends TaskState {
  createTask: (data: CreateTaskInput) => Promise<Task>
  updateTask: (id: string, data: UpdateTaskInput) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
  loadTasks: (filters?: TaskFilterOptions) => Promise<void>
  setFilter: (filters: TaskFilterOptions) => void
  clearFilters: () => void
  setSelectedTask: (task: Task | null) => void
  completeTask: (id: string) => Promise<Task>
  uncompleteTask: (id: string) => Promise<Task>
}

const defaultTaskState: TaskState = {
  tasks: [],
  selectedTask: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
}

export const TaskContext = createContext<TaskContextType>({
  ...defaultTaskState,
  createTask: async () => ({ id: '', user_id: '', title: '', status: TaskStatus.PENDING, priority: TaskPriority.MEDIUM, created_at: '', updated_at: '' }),
  updateTask: async () => ({ id: '', user_id: '', title: '', status: TaskStatus.PENDING, priority: TaskPriority.MEDIUM, created_at: '', updated_at: '' }),
  deleteTask: async () => {},
  loadTasks: async () => {},
  setFilter: () => {},
  clearFilters: () => {},
  setSelectedTask: () => {},
  completeTask: async () => ({ id: '', user_id: '', title: '', status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM, created_at: '', updated_at: '' }),
  uncompleteTask: async () => ({ id: '', user_id: '', title: '', status: TaskStatus.PENDING, priority: TaskPriority.MEDIUM, created_at: '', updated_at: '' }),
})

interface TaskProviderProps {
  children: React.ReactNode
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [state, setState] = useState<TaskState>(defaultTaskState)
  const { isAuthenticated, isLoading: authIsLoading } = useAuth()

  /**
   * Load tasks from API
   */
  const loadTasks = useCallback(async (filters?: TaskFilterOptions) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await tasksService.getTasks({
        ...state.filters,
        ...filters,
        page: filters?.page || state.pagination.page,
        limit: filters?.limit || state.pagination.limit,
      })

      setState((prev) => ({
        ...prev,
        tasks: response.data,
        pagination: response.pagination,
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      const apiError = error instanceof Error ? { message: error.message } : error
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: apiError as ApiError,
      }))
    }
  }, [state.filters, state.pagination.page, state.pagination.limit])

  /**
   * Create a new task
   */
  const createTask = useCallback(async (data: CreateTaskInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const newTask = await tasksService.createTask(data)

      // Optimistic update
      setState((prev) => ({
        ...prev,
        tasks: [newTask, ...prev.tasks],
        isLoading: false,
        error: null,
      }))

      return newTask
    } catch (error) {
      const apiError = error instanceof Error ? { message: error.message } : error
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: apiError as ApiError,
      }))
      throw error
    }
  }, [])

  /**
   * Update an existing task
   */
  const updateTask = useCallback(async (id: string, data: UpdateTaskInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const updatedTask = await tasksService.updateTask(id, data)

      // Optimistic update
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) => (task.id === id ? updatedTask : task)),
        selectedTask: prev.selectedTask?.id === id ? updatedTask : prev.selectedTask,
        isLoading: false,
        error: null,
      }))

      return updatedTask
    } catch (error) {
      const apiError = error instanceof Error ? { message: error.message } : error
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: apiError as ApiError,
      }))
      throw error
    }
  }, [])

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      await tasksService.deleteTask(id)

      // Optimistic update
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((task) => task.id !== id),
        selectedTask: prev.selectedTask?.id === id ? null : prev.selectedTask,
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      const apiError = error instanceof Error ? { message: error.message } : error
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: apiError as ApiError,
      }))
      throw error
    }
  }, [])

  /**
   * Mark task as completed
   */
  const completeTask = useCallback(async (id: string) => {
    return updateTask(id, {
      status: TaskStatus.COMPLETED,
      completed_at: new Date().toISOString(),
    })
  }, [updateTask])

  /**
   * Mark task as pending (uncomplete)
   */
  const uncompleteTask = useCallback(async (id: string) => {
    return updateTask(id, {
      status: TaskStatus.PENDING,
      completed_at: undefined,
    })
  }, [updateTask])

  /**
   * Set filter options
   */
  const setFilter = useCallback((filters: TaskFilterOptions) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...filters,
      },
      pagination: {
        ...prev.pagination,
        page: 1, // Reset to first page when filtering
      },
    }))
  }, [])

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: {},
      pagination: {
        ...prev.pagination,
        page: 1,
      },
    }))
  }, [])

  /**
   * Set selected task for detail view
   */
  const setSelectedTask = useCallback((task: Task | null) => {
    setState((prev) => ({
      ...prev,
      selectedTask: task,
    }))
  }, [])

  /**
   * Load tasks when authentication is completed
   */
  useEffect(() => {
    // Only load tasks if user is authenticated and auth is not loading
    if (!authIsLoading && isAuthenticated) {
      const loadInitialTasks = async () => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }))

        try {
          const response = await tasksService.getTasks({
            page: 1,
            limit: 20,
          })

          setState((prev) => ({
            ...prev,
            tasks: response.data,
            pagination: response.pagination,
            isLoading: false,
            error: null,
          }))
        } catch (error) {
          const apiError = error instanceof Error ? { message: error.message } : error
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: apiError as ApiError,
          }))
        }
      }

      loadInitialTasks()
    }
  }, [isAuthenticated, authIsLoading])

  const value: TaskContextType = {
    ...state,
    createTask,
    updateTask,
    deleteTask,
    loadTasks,
    setFilter,
    clearFilters,
    setSelectedTask,
    completeTask,
    uncompleteTask,
  }

  return (
    <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
  )
}
