import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { dashboardNavigation } from '@/const/navigation'
import type { NavItem } from '@/types/navigation'
import type { Role } from '@/types/auth'

const filterItems = (items: NavItem[], currentRole: string): NavItem[] => {
  return items
    .filter((item) => !item.roles || item.roles.includes(currentRole as Role))
    .map((item) => {
      if (item.children) {
        return { ...item, children: filterItems(item.children, currentRole) }
      }
      return item
    })
    .filter((item) => !item.children || item.children.length > 0)
}

export const useNavigation = () => {
  const authStore = useAuthStore()

  const visibleMenu = computed(() => {
    const currentRole = authStore.activeRole || ''
    return filterItems(dashboardNavigation, currentRole)
  })

  return { visibleMenu }
}
