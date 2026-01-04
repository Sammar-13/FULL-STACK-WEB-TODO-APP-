/**
 * HTTP API Client with Cookie-Based Authentication
 * Handles authentication via HTTP-only cookies, token refresh, and error handling
 * Task: 02-055
 */

import { ApiError, TokenResponse } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface FetchOptions extends RequestInit {
  skipAuth?: boolean
  skipRefresh?: boolean
}

class APIClient {
  private baseURL: string
  private refreshPromise: Promise<TokenResponse> | null = null

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    }
  }

  async refreshAccessToken(): Promise<TokenResponse> {
    // Return existing refresh promise if one is already in progress
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    // Refresh token is in HTTP-only cookie, sent automatically by browser
    this.refreshPromise = this.fetchAPI<TokenResponse>(
      '/auth/refresh',
      {
        method: 'POST',
        skipAuth: true,
        skipRefresh: true,
      }
    )

    try {
      const response = await this.refreshPromise
      // Tokens are now in HTTP-only cookies set by backend
      return response
    } finally {
      this.refreshPromise = null
    }
  }

  async fetchAPI<T = unknown>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const fetchOptions: RequestInit = {
      ...options,
      headers: this.getHeaders(),
      credentials: 'include', // CRITICAL: Send cookies with every request
      signal: AbortSignal.timeout(30000), // 30 second timeout
    }

    try {
      const response = await fetch(url, fetchOptions)

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && !options.skipRefresh) {
        try {
          await this.refreshAccessToken()
          // Retry the original request with new token (in cookie)
          fetchOptions.headers = this.getHeaders()
          const retryResponse = await fetch(url, fetchOptions)

          if (!retryResponse.ok) {
            await this.handleErrorResponse(retryResponse)
          }

          return this.parseResponse<T>(retryResponse)
        } catch (error) {
          // Refresh failed, redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          throw error
        }
      }

      if (!response.ok) {
        await this.handleErrorResponse(response)
      }

      return this.parseResponse<T>(response)
    } catch (error) {
      if (error instanceof APIErrorResponse) {
        throw error
      }

      // Check if it's a timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIErrorResponse(
          'Request timed out. Backend may be offline or database unavailable.',
          'REQUEST_TIMEOUT',
          408,
          error
        )
      }

      // Check for other network errors
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
        throw new APIErrorResponse(
          `Network error. Cannot reach backend at ${this.baseURL}. Is the backend running?`,
          'NETWORK_ERROR',
          0,
          error
        )
      }

      throw new APIErrorResponse('Network error', 'NETWORK_ERROR', 0, error)
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    const contentType = response.headers.get('content-type')
    let errorData: ApiError = {
      status: response.status,
      message: response.statusText,
    }

    if (contentType?.includes('application/json')) {
      try {
        const data = await response.json()
        errorData = {
          ...errorData,
          detail: data.detail || data.message,
          error_code: data.error_code || data.code,
        }
      } catch {
        // JSON parse failed, use default error
      }
    }

    throw new APIErrorResponse(
      errorData.detail || errorData.message || 'An error occurred',
      errorData.error_code || 'UNKNOWN_ERROR',
      response.status,
      errorData
    )
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      return response.json()
    }

    return response.text() as unknown as T
  }

  // Tokens are now stored in HTTP-only cookies set by the backend
  // These methods are deprecated but kept for compatibility
  setToken(): void {
    // Tokens are set by backend in HTTP-only cookies
    // This method is kept for compatibility but does nothing
  }

  getAccessToken(): string | null {
    // Cannot access HTTP-only cookies from JavaScript
    // This returns null - tokens are automatically sent by browser
    return null
  }

  getRefreshToken(): string | null {
    // Cannot access HTTP-only cookies from JavaScript
    // This returns null - tokens are automatically sent by browser
    return null
  }

  logout(): void {
    // Logout is handled by backend clearing cookies
    // This method is kept for compatibility
  }

  clearTokens(): void {
    // Tokens are in HTTP-only cookies - cannot be cleared from JavaScript
    // Use POST /auth/logout endpoint instead
  }

  isAuthenticated(): boolean {
    // Cannot determine authentication from cookies in JavaScript
    // Use GET /auth/verify endpoint instead
    return false
  }
}

export class APIErrorResponse extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'APIErrorResponse'
  }
}

export const apiClient = new APIClient()

export default apiClient
