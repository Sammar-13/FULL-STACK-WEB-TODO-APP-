/**
 * Format Utility Functions
 * Helper functions for formatting data for display
 * Task: 41
 */

import { TaskStatus, TaskPriority } from '@/types'

/**
 * Format date to readable string (e.g., "Jan 1, 2024")
 */
export function formatDate(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

/**
 * Format time to readable string (e.g., "1:30 PM")
 */
export function formatTime(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return ''
  }
}

/**
 * Format datetime (e.g., "Jan 1, 2024 at 1:30 PM")
 */
export function formatDateTime(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return ''
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`
    return `${Math.floor(seconds / 31536000)} years ago`
  } catch {
    return ''
  }
}

/**
 * Format task status for display
 */
export function formatStatus(status: TaskStatus | string): string {
  const statusMap: Record<string, string> = {
    [TaskStatus.PENDING]: 'Pending',
    [TaskStatus.COMPLETED]: 'Completed',
    [TaskStatus.ARCHIVED]: 'Archived',
  }

  return statusMap[status] || status
}

/**
 * Format priority for display
 */
export function formatPriority(priority: TaskPriority | string): string {
  const priorityMap: Record<string, string> = {
    [TaskPriority.LOW]: 'Low',
    [TaskPriority.MEDIUM]: 'Medium',
    [TaskPriority.HIGH]: 'High',
  }

  return priorityMap[priority] || priority
}

/**
 * Get CSS class for priority badge
 */
export function getPriorityBadgeClass(priority: TaskPriority | string): string {
  const classMap: Record<string, string> = {
    [TaskPriority.LOW]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [TaskPriority.HIGH]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  return classMap[priority] || classMap[TaskPriority.MEDIUM]
}

/**
 * Get CSS class for status badge
 */
export function getStatusBadgeClass(status: TaskStatus | string): string {
  const classMap: Record<string, string> = {
    [TaskStatus.PENDING]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [TaskStatus.ARCHIVED]: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
  }

  return classMap[status] || classMap[TaskStatus.PENDING]
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(dm)} ${sizes[i]}`
}

export default {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatStatus,
  formatPriority,
  getPriorityBadgeClass,
  getStatusBadgeClass,
  truncateText,
  formatBytes,
}
