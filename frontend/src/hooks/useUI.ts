/**
 * useUI Hook
 * Provides access to UI context
 */

'use client'

import { useContext } from 'react'
import { UIContext, UIContextType } from '@/context/UIContext'

export function useUI(): UIContextType {
  const context = useContext(UIContext)

  if (!context) {
    throw new Error('useUI must be used within a UIProvider')
  }

  return context
}

export default useUI
