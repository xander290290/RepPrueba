const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/intranet/v1'

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface User {
  id: string
  name: string
  surname: string
  email: string
  roles: string[]
  created_at: string
}

export interface Role {
  name: string
  description: string
}

export interface NewUser {
  name: string
  surname: string
  email: string
  password: string
  role: string
}

interface ApiErrorBody {
  detail?: string | Array<{ msg?: string }>
  message?: string
}

export class ApiError extends Error {
  readonly status: number

  constructor(
    message: string,
    status: number,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(
  path: string,
  options: {
    method?: string
    token?: string
    body?: unknown
  } = {},
): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' })
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new Error(
      'No se pudo conectar con la API. Comprueba que FastAPI está iniciado y que la URL configurada es correcta.',
    )
  }

  const responseText = await response.text()
  let responseBody: ApiErrorBody | T | undefined
  if (responseText) {
    try {
      responseBody = JSON.parse(responseText) as ApiErrorBody | T
    } catch {
      if (!response.ok) {
        throw new ApiError(
          `La API respondió con un formato inesperado (HTTP ${response.status}).`,
          response.status,
        )
      }
      throw new Error('La API devolvió una respuesta JSON no válida.')
    }
  }

  if (!response.ok) {
    const errorBody = responseBody as ApiErrorBody | undefined
    const detail = errorBody?.detail
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).filter(Boolean).join(' ')
      : detail ?? errorBody?.message
    throw new ApiError(
      message || `La solicitud a la API falló (HTTP ${response.status}).`,
      response.status,
    )
  }

  if (responseBody === undefined) {
    throw new Error('La API devolvió una respuesta vacía inesperada.')
  }
  return responseBody as T
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Se produjo un error inesperado.'
}

export function login(email: string, password: string) {
  return request<AuthTokens>('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function getCurrentUser(token: string) {
  return request<User>('/users/me', { token })
}

export function logout(token: string) {
  return request<{ message: string }>('/auth/logout', {
    method: 'POST',
    token,
  })
}

export function getUsers(token: string) {
  return request<User[]>('/users', { token })
}

export function createUser(token: string, user: NewUser) {
  return request<User>('/users/register', {
    method: 'POST',
    token,
    body: user,
  })
}

export function getRoles(token: string) {
  return request<Role[]>('/roles', { token })
}

export function getRolePermissions(token: string, roleName: string) {
  return request<string[]>(`/roles/${encodeURIComponent(roleName)}/permissions`, {
    token,
  })
}
