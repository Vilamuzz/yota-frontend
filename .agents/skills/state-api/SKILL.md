# Skill: State, Local Storage, & Axios API Core Integration

This document defines the strict integration patterns connecting Vue 3 view-state hooks, Pinia data stores, and backend communications via the centralized Axios client envelope. AI agents must mirror these reactive flow states and token manipulation protocols perfectly.

---

## 1. Centralized HTTP Network Blueprint (`src/utils/api.ts`)

All network connectivity to the Go backend must utilize the configured `api` Axios client instance. Direct un-intercepted calls via standard `axios` or raw `fetch` references are strictly prohibited.

### Execution Interceptor Mechanics
- **Token Injection:** The request interceptor systematically fetches access tokens from local container stores (`localStorage.getItem('token')`) and appends them via the standard format: `Authorization: Bearer <token>`.
- **Session Expiry Watcher:** The response interceptor automatically handles backend `401 Unauthorized` responses. If a session invalidation is detected outside public login sequences, it automatically clears states and pushes a relative path redirect payload into the global `window.location`.

```typescript
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthRoute = window.location.pathname.includes('/auth') || window.location.pathname.includes('/login')

    if (error.response?.status === 401 && !isAuthRoute) {
      const token = localStorage.getItem('token')
      localStorage.removeItem('token')

      const message = token ? 'session_expired' : 'login_required'
      const currentPath = encodeURIComponent(window.location.pathname + window.location.search)

      window.location.href = `/login?message=${message}&redirect=${currentPath}`
    }
    return Promise.reject(error)
  }
)

```

---

## 2. Service Layer Payload Mapping & Response Envelopes

Service modules located in `src/services/` map directly to backend endpoints and mirror the Go server's `pkg.NewResponse` schema.

### Core Type Matching Layout (`src/types/response.ts`)

```typescript
export interface BaseResponse<T> {
  status: number
  message: string
  data: T
  meta?: {
    current_page?: number
    total_pages?: number
    total_items?: number
    per_page?: number
  }
}

```

### Service Invocation Model Sample (`src/services/donationProgram.service.ts`)

Service methods pass standard Axios response structures back up to processing hooks, keeping backend envelope access transparent.

```typescript
import { api } from '@/utils/api'
import type { BaseResponse } from '@/types/response'
import type { DonationProgram, CreateProgramRequest } from '@/types/donationProgram'

export const donationProgramService = {
  async create(payload: CreateProgramRequest): Promise<BaseResponse<DonationProgram>> {
    const response = await api.post<BaseResponse<DonationProgram>>('/donation_program', payload)
    return response.data
  }
}

```

---

## 3. Composable Reactive State Isolation

Feature hooks inside `src/composables/` capture transient states (loading triggers, API payloads, error messages) using standard Vue 3 reactivity primitives (`ref`, `computed`). They do not hide asynchronous processes inside untyped wrappers.

### Composable Coding Blueprint

Every asynchronous view wrapper must expose uniform tracking states: `{ isLoading, error, data, execute }`.

```typescript
// src/composables/donationProgram/useDonationProgramCreate.ts
import { ref } from 'vue'
import { donationProgramService } from '@/services/donationProgram.service'
import type { DonationProgram, CreateProgramRequest } from '@/types/donationProgram'
import type { AxiosError } from 'axios'

export function useDonationProgramCreate() {
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const data = ref<DonationProgram null |>(null)

  async function execute(payload: CreateProgramRequest): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const res = await donationProgramService.create(payload)
      data.value = res.data
      return true
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>
      error.value = axiosError.response?.data?.message || 'Gagal membuat program donasi'
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    data,
    execute,
  }
}

```

---

## 4. ❌ FORBIDDEN AI ANTI-PATTERNS (DO NOT GENERATE)

1. **Rogue LocalStorage Mutations:** Do not write random `localStorage.setItem` keys inside UI component blocks to handle session access tokens. Token clearance and session teardowns are explicitly handled inside `api.ts` or the centralized Pinia `auth` store.
2. **Raw Domain Swallowing:** Do not strip the `BaseResponse` layout wrapper at the service level before passing it up. Composables rely on reading the status properties to handle business logic branches.
3. **Implicit Error Casting:** Do not intercept exceptions without safely identifying `AxiosError` interfaces. Avoid using un-typed errors like `error.message` directly without inspecting deep backend exception payloads first.
4. **Shared Composable Contamination:** Do not share state variables directly between different structural modules inside a single composable file unless explicitly wiring a global reactive hook instance pattern. Each functional file execution must preserve separate reactive fields.

```
</DonationProgram></BaseResponse<DonationProgram></BaseResponse<DonationProgram></T>

```