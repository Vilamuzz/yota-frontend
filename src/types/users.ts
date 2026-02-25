import type { Response, Pagination } from './response'

export interface User {
  id: string
  username: string
  email: string
  role: Role
  status: boolean
  created_at: string
}

export interface UserList {
  users: User[]
  pagination: Pagination
}

export interface UpdateUserRequest {
  role_id?: number
  status?: boolean
}

export interface Role {
  id: number
  role: string
}

export interface UsersParams {
  limit?: number
  next_cursor?: string
  prev_cursor?: string
  search?: string
  role?: number
  status?: boolean
}

export type UserResponse = Response<User>
export type UserListResponse = Response<UserList>
export type RolesResponse = Response<Role[]>
