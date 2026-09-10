import { env } from '../config/env'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

const REQUEST_TIMEOUT_MS = 60_000

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${env.apiBaseUrl}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText)
      throw new ApiError(response.status, message || `Request failed (${response.status})`)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json() as Promise<T>
  } finally {
    window.clearTimeout(timeoutId)
  }
}
