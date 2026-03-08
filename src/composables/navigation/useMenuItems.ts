import type { Component } from 'vue'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'
import { Home, Newspaper, Users, CirclePoundSterling } from 'lucide-vue-next'

export interface MenuItem {
  icon?: Component
  label: string
  path?: string
  name: string
  children?: MenuItem[]
}

export function useMenuItems() {
  const { user } = useCurrentUser()
  const route = useRoute()

  const expandedMenus = ref<Record<string, boolean>>({})

  const toggleSubMenu = (menuName: string) => {
    expandedMenus.value[menuName] = !expandedMenus.value[menuName]
  }

  const menuItems = computed<MenuItem[]>(() => {
    const role = user.value?.role?.toLowerCase() || ''

    const items: MenuItem[] = [
      { icon: Home, label: 'Dashboard', path: '/dashboard', name: 'dashboard' },
    ]

    if (role === 'superadmin') {
      items.push({ icon: Users, label: 'Users', path: '/dashboard/users', name: 'users' })
    }

    if (role === 'superadmin' || role === 'finance') {
      items.push({ icon: Users, label: 'Donasi', path: '/dashboard/donations', name: 'donations' })
    }

    if (role === 'superadmin' || role === 'finance') {
      items.push({
        icon: CirclePoundSterling,
        label: 'Pemasukan',
        name: 'income',
        children: [
          { label: 'Donasi', path: '/dashboard/donation-income/', name: 'donation-income' },
          {
            label: 'Program Sosial',
            path: '/dashboard/income/social-program',
            name: 'social-program',
          },
          { label: 'Anak Asuh', path: '/dashboard/income/orphan', name: 'orphan' },
        ],
      })
    }

    items.push({ icon: Newspaper, label: 'News', path: '/dashboard/news', name: 'news' })

    return items
  })

  const isActive = (name: string) => {
    return route.name === name || route.path.startsWith(`/dashboard/${name}`)
  }

  const isSubMenuActive = (children: MenuItem[]) => {
    return children.some((child) => isActive(child.name))
  }

  return {
    menuItems,
    expandedMenus,
    toggleSubMenu,
    isActive,
    isSubMenuActive,
  }
}
