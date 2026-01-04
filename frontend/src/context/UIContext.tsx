/**
 * UI Context
 * Manages UI state (theme, sidebar, notifications)
 * Task: 02-061
 */

'use client'

import React, { createContext, useCallback, useState, useEffect } from 'react'
import { UIState, Toast } from '@/types'

export interface UIContextType extends UIState {
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  showToast: (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
    duration?: number
  ) => void
  hideToast: (id: string) => void
  clearToasts: () => void
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
  toggleModal: (modalId: string) => void
}

const defaultUIState: UIState = {
  theme: 'light',
  sidebarOpen: true,
  toasts: [],
  modals: {},
}

export const UIContext = createContext<UIContextType>({
  ...defaultUIState,
  toggleTheme: () => {},
  setTheme: () => {},
  toggleSidebar: () => {},
  setSidebarOpen: () => {},
  showToast: () => {},
  hideToast: () => {},
  clearToasts: () => {},
  openModal: () => {},
  closeModal: () => {},
  toggleModal: () => {},
})

interface UIProviderProps {
  children: React.ReactNode
}

const THEME_STORAGE_KEY = 'theme'
const SIDEBAR_STORAGE_KEY = 'sidebar_open'

export function UIProvider({ children }: UIProviderProps) {
  const [state, setState] = useState<UIState>(defaultUIState)
  const [mounted, setMounted] = useState(false)

  /**
   * Initialize UI state from localStorage
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as
        | 'light'
        | 'dark'
        | null
      const storedSidebar = localStorage.getItem(SIDEBAR_STORAGE_KEY)
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches

      const theme = storedTheme || (prefersDark ? 'dark' : 'light')
      const sidebarOpen =
        storedSidebar !== null ? storedSidebar === 'true' : true

      setState((prev) => ({
        ...prev,
        theme,
        sidebarOpen,
      }))

      // Apply theme to document
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }

    setMounted(true)
  }, [])

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = useCallback(() => {
    setState((prev) => {
      const newTheme = prev.theme === 'light' ? 'dark' : 'light'

      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme)
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
      }

      return { ...prev, theme: newTheme }
    })
  }, [])

  /**
   * Set theme explicitly
   */
  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setState((prev) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, theme)
        document.documentElement.classList.toggle('dark', theme === 'dark')
      }

      return { ...prev, theme }
    })
  }, [])

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = useCallback(() => {
    setState((prev) => {
      const newState = !prev.sidebarOpen

      if (typeof window !== 'undefined') {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newState))
      }

      return { ...prev, sidebarOpen: newState }
    })
  }, [])

  /**
   * Set sidebar visibility explicitly
   */
  const setSidebarOpen = useCallback((open: boolean) => {
    setState((prev) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open))
      }

      return { ...prev, sidebarOpen: open }
    })
  }, [])

  /**
   * Show a toast notification
   */
  const showToast = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'warning' | 'info' = 'info',
      duration = 3000
    ) => {
      const id = `toast-${Date.now()}-${Math.random()}`
      const toast: Toast = { id, type, message, duration }

      setState((prev) => ({
        ...prev,
        toasts: [...prev.toasts, toast],
      }))

      // Auto-dismiss if duration is provided
      if (duration > 0) {
        setTimeout(() => {
          hideToast(id)
        }, duration)
      }

      return id
    },
    []
  )

  /**
   * Hide a specific toast
   */
  const hideToast = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      toasts: prev.toasts.filter((toast) => toast.id !== id),
    }))
  }, [])

  /**
   * Clear all toasts
   */
  const clearToasts = useCallback(() => {
    setState((prev) => ({
      ...prev,
      toasts: [],
    }))
  }, [])

  /**
   * Open a modal
   */
  const openModal = useCallback((modalId: string) => {
    setState((prev) => ({
      ...prev,
      modals: {
        ...prev.modals,
        [modalId]: true,
      },
    }))
  }, [])

  /**
   * Close a modal
   */
  const closeModal = useCallback((modalId: string) => {
    setState((prev) => ({
      ...prev,
      modals: {
        ...prev.modals,
        [modalId]: false,
      },
    }))
  }, [])

  /**
   * Toggle modal visibility
   */
  const toggleModal = useCallback((modalId: string) => {
    setState((prev) => ({
      ...prev,
      modals: {
        ...prev.modals,
        [modalId]: !prev.modals[modalId],
      },
    }))
  }, [])

  const value: UIContextType = {
    ...state,
    toggleTheme,
    setTheme,
    toggleSidebar,
    setSidebarOpen,
    showToast,
    hideToast,
    clearToasts,
    openModal,
    closeModal,
    toggleModal,
  }

  if (!mounted) {
    return <>{children}</>
  }

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}
