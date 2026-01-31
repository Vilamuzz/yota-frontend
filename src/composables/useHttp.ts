import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/vue-query'
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import { unref, type ComputedRef, type Ref } from 'vue'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    Object.assign(config.headers, { Authorization: `Bearer ${token}` })
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (location.href.includes('user') && !location.href.includes('login')) {
        localStorage.removeItem('token')
        setTimeout(() => {
          window.location.replace('/auth/login')
        }, 1000)
      }
    }
    throw error
  },
)

type ResponseData<TData = unknown> = {
  data: TData
}

type Config<TData = unknown, TError = DefaultError> = {
  keys?: unknown[]
  params?: Record<string, unknown>
  httpOptions?: AxiosRequestConfig
  queryOptions?: UseQueryOptions<TData, TError>
}

type DefaultError = {
  message: string
  validation: object
}

/**
  * API GET Method request only.
  * @example
      const { data: items, isLoading, isError } = useHttp<number, string>('/', {
        keys: ['id']
        queryOptions: {
          onSuccess: function (data) {
            return
          },
          onError: function (data) {
            data
          },
        },
      })
  * @param url URL API
  * @param options HTTP Mutation Options
  */
export function useHttp<TData = unknown, TError = unknown>(
  url: Ref<string> | string,
  options?: Config<TData, TError>,
) {
  const defaultOptions = {
    queryKey: [url, options],
    queryFn: async (): Promise<TData> => {
      const defaultConfig = {}

      if (options?.params) {
        Object.assign(defaultConfig, { params: unref(options.params) })
      }
      const { data } = await http.get<ResponseData<TData>>(unref(url), defaultConfig)
      return data.data as TData
    },
  }

  if (options?.queryOptions) {
    Object.assign(defaultOptions, options.queryOptions)
  }
  return useQuery<TData, TError>(defaultOptions)
}

type HttpMutationOptions<
  TData = unknown,
  TError = unknown,
  TVariables = unknown,
  TContext = unknown,
> = {
  method: 'GET' | 'HEAD' | 'POST' | 'OPTIONS' | 'PUT' | 'DELETE' | 'PATCH'
  httpOptions?: AxiosRequestConfig
  queryOptions?: UseMutationOptions<TData, TError, TVariables, TContext>
}

/**
  * Update data to the server.
  * @example
    const {mutate, isLoading, isError, error} =  useHttpMutation<TData, TError>('todos/:id', {
      method: 'POST',
      httpOptions: { // axios options
        timeout: 30000,
      },
      queryOptions: { // vue-query options
        onSuccess: function (data) {
          console.log(data);
        },
        onError: function (data) {
          console.log(data);
        },
      },
      })
      const onSubmitForm = (data) => {
        mutate(data)
      }
  * @param url URL API
  * @param options HTTP Mutation Options
  */
export function useHttpMutation<
  TData = unknown,
  TError = AxiosResponse<DefaultError>,
  TVariables = unknown,
>(url: Ref<string> | string | ComputedRef<string>, options: HttpMutationOptions<TData, TError>) {
  return useMutation({
    mutationFn: (value: TVariables) => {
      return new Promise<TData>((resolve, reject) => {
        return http
          .request<TData>({
            url: unref(url),
            method: options.method,
            ...options.httpOptions,
            data: value,
          })
          .then((response) => {
            resolve(response.data)
          })
          .catch((error: AxiosError<TError>) => {
            reject(error.response ?? error.message)
          })
      })
    },
    ...options.queryOptions,
  })
}
