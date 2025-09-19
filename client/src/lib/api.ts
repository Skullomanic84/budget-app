// client/src/lib/api.ts
import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

/**
 * Base URL from Vite env
 * e.g. VITE_API_URL=http://localhost:4000
 */
const BASE_URL = import.meta.env.VITE_API_URL as string
if (!BASE_URL) {
  // Fail fast in dev if you forgot the env
  // eslint-disable-next-line no-console
  console.warn('VITE_API_URL is not set. Set it in client/.env')
}

/** Token storage */
const TOKEN_KEY = 'accessToken'
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/** Axios instance */
export const api = axios.create({
  baseURL: BASE_URL,
  // You can set a short timeout in dev if you want:
  // timeout: 10000,
})

/** Attach Authorization header if token exists */
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  // JSON by default
  if (!config.headers || !('Content-Type' in config.headers)) {
    config.headers = {
      ...(config.headers || {}),
      'Content-Type': 'application/json',
    }
  }
  return config
})

/** Normalize API errors to simple Error(message) */
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<any>) => {
    // Our backend error shape: { error: string; message?: string; details?: unknown }
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Request failed'

    // For 401s, you *may* want to clearToken() and redirect to /login:
    // if (err.response?.status === 401) clearToken()

    return Promise.reject(new Error(message))
  }
)

/** Generic helpers with typing */
export async function get<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
) {
  const res = await api.get<T>(url, config)
  return res.data
}
export async function post<T = unknown>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
) {
  const res = await api.post<T>(url, body, config)
  return res.data
}
export async function patch<T = unknown>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
) {
  const res = await api.patch<T>(url, body, config)
  return res.data
}
export async function del<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
) {
  const res = await api.delete<T>(url, config)
  return res.data
}

/** Auth-specific helpers */
export type LoginResponse = {
  accessToken: string
  user: { id: string; email: string; name?: string | null }
}

export async function login(payload: { email: string; password: string }) {
  const data = await post<LoginResponse>('/auth/login', payload)
  setToken(data.accessToken)
  return data
}

export async function register(payload: {
  email: string
  password: string
  name?: string
}) {
  const data = await post<LoginResponse>('/auth/register', payload)
  setToken(data.accessToken)
  return data
}

export async function logout() {
  try {
    await post('/auth/logout')
  } finally {
    clearToken()
  }
}
