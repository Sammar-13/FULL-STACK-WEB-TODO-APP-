/**
 * Tasks Service
 * Handles todo CRUD operations and filtering
 * Task: 02-057
 */

import apiClient from '@/utils/api'
import {
  Task,
  TaskList,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterOptions,
  TaskStatus,
} from '@/types'

class TasksService {
  /**
   * Get all tasks with optional filtering
   */
  async getTasks(filters?: TaskFilterOptions): Promise<TaskList> {
    const params = new URLSearchParams()

    if (filters?.status) params.append('status_filter', filters.status)
    if (filters?.priority) params.append('priority_filter', filters.priority)
    if (filters?.page) params.append('skip', ((filters.page - 1) * (filters.limit || 10)).toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const queryString = params.toString()
    const url = `/tasks${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.fetchAPI<any>(url, {
      method: 'GET',
    })

    // Transform backend response to match frontend TaskList interface
    return {
      data: response.items || [],
      pagination: {
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        total: response.total || 0,
        pages: response.pages || Math.ceil((response.total || 0) / (filters?.limit || 10)),
      },
    }
  }

  /**
   * Get a specific task by ID
   */
  async getTask(id: string): Promise<Task> {
    const response = await apiClient.fetchAPI<Task>(
      `/tasks/${id}`,
      {
        method: 'GET',
      }
    )

    return response
  }

  /**
   * Create a new task
   */
  async createTask(data: CreateTaskInput): Promise<Task> {
    const response = await apiClient.fetchAPI<Task>(
      '/tasks',
      {
        method: 'POST',
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          priority: data.priority || 'medium',
          due_date: data.due_date,
        }),
      }
    )

    return response
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
    const response = await apiClient.fetchAPI<Task>(
      `/tasks/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    )

    return response
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    await apiClient.fetchAPI(`/tasks/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Mark a task as completed
   */
  async completeTask(id: string): Promise<Task> {
    return this.updateTask(id, {
      status: TaskStatus.COMPLETED,
      completed_at: new Date().toISOString(),
    })
  }

  /**
   * Mark a task as pending
   */
  async uncompleteTask(id: string): Promise<Task> {
    return this.updateTask(id, {
      status: TaskStatus.PENDING,
      completed_at: undefined,
    })
  }
}

export const tasksService = new TasksService()

export default tasksService
