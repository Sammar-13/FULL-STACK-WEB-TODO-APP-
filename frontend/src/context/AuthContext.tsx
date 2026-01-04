/**
 * Authentication Context
 * Manages authentication state and provides auth methods
 * Task: 02-059
 */

'use client'

import React, { createContext, useCallback, useEffect, useState } from 'react'
import authService from '@/services/auth'
import { AuthState, LoginInput, SignUpInput, ApiError } from '@/types'
import apiClient from '@/utils/api'

export interface AuthContextType extends AuthState {
  signup: (data: SignUpInput) => Promise<void>
  login: (data: LoginInput) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
}

const defaultAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
}

export const AuthContext = createContext<AuthContextType>({
  ...defaultAuthState,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  refreshToken: async () => {},
})

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(defaultAuthState)

  /**
   * Initialize authentication on mount by verifying session
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { authenticated, user } = await authService.verifySession()
        
        if (authenticated && user) {
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            tokens: {
              accessToken: null,
              refreshToken: null,
            },
          })
        } else {
          setState((prev) => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    initializeAuth()
  }, [])

  /**
   * Handle user signup
   */
  const signup = useCallback(async (data: SignUpInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await authService.signup(data)
      // Tokens are now in HTTP-only cookies, set by backend

      setState((prev) => ({
        ...prev,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        tokens: {
          // Tokens are in cookies, not accessible here
          accessToken: null,
          refreshToken: null,
        },
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
   * Handle user login
   */
  const login = useCallback(async (data: LoginInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await authService.login(data)
      // Tokens are now in HTTP-only cookies, set by backend

      setState((prev) => ({
        ...prev,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        tokens: {
          // Tokens are in cookies, not accessible here
          accessToken: null,
          refreshToken: null,
        },
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
   * Handle user logout
   */
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      await authService.logout()
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        tokens: {
          accessToken: null,
          refreshToken: null,
        },
      })
    } catch (error) {
      // Still clear auth state even if logout API fails
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        tokens: {
          accessToken: null,
          refreshToken: null,
        },
      })
    }
  }, [])

  /**
   * Refresh access token
   */
  const handleRefreshToken = useCallback(async () => {
    try {
      await authService.refresh()
      const newAccessToken = apiClient.getAccessToken()
      const newRefreshToken = apiClient.getRefreshToken()

      setState((prev) => ({
        ...prev,
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        error: null,
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        tokens: {
          accessToken: null,
          refreshToken: null,
        },
      }))
      throw error
    }
  }, [])

  const value: AuthContextType = {
    ...state,
    signup,
    login,
    logout,
    refreshToken: handleRefreshToken,
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}
