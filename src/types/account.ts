import type { Response, Pagination, PaginationParams } from './response'

export interface Account {
  id: string
  username: string
  email: string
  isBanned: boolean
  roles: AccountRole[]
  userProfile: UserProfile
  createdAt: string
}

export interface Driver {
  id: string
  username: string
  phone: string
}

export interface AccountRole {
  roleId: number
  roleName: string
  isDefault: boolean
  isActive: boolean
}

export interface AccountList {
  accounts: Account[]
  pagination: Pagination
}

export interface UserProfile {
  id: string
  username: string
  email: string
  roles: AccountRole[]
  profilePicture: string
  phone: string
  address: string
}

export interface Role {
  id: number
  name: string
}

export interface Roles {
  roles: Role[]
}

export interface CreateAccountRequest {
  username: string
  email: string
  password: string
}

export interface SetAccountBanStatusRequest {
  banStatus: boolean
}

export interface UpdateUserProfileRequest {
  username: string
  email: string
  defaultAccountRoleId: number
  phone: string
  address: string
  profilePicture: File
}

export interface UpdateUserPasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface AccountQueryParam extends PaginationParams {
  roleId?: number
  isBanned?: boolean
  sortOrder?: SortOrderEnum
}

export enum SortOrderEnum {
  ASC = 'asc',
  DESC = 'desc',
}

export interface UpdateAccountRoleRequest {
  isActive: boolean
}

export type AccountResponse = Response<Account>
export type AccountListResponse = Response<AccountList>
export type UserProfileResponse = Response<UserProfile>
export type RolesResponse = Response<Roles>
