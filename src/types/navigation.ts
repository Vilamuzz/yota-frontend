import type { Component, VNode } from 'vue'
import type { Role } from './auth'

export interface NavItem {
  label: string
  route?: string
  icon?: Component | VNode
  roles?: Role[]
  children?: NavItem[]
}
