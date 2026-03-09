import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthGuard } from '@/composables/auth/useAuthGuard'
import { menuConfig, type MenuItemConfig } from '@/config/menuConfig'

export type { MenuItemConfig as MenuItem }

export function useMenuItems() {
  const { userRole } = useAuthGuard()
  const route = useRoute()

  const expandedMenus = ref<Record<string, boolean>>(
    JSON.parse(sessionStorage.getItem('expandedMenus') || '{}'),
  )

  function isAllowed(item: MenuItemConfig): boolean {
    if (!item.roles) return true
    const role = userRole.value?.toLowerCase() || ''
    return item.roles.includes(role)
  }

  const menuItems = computed(() =>
    menuConfig.filter(isAllowed).map((item) => ({
      ...item,
      children: item.children?.filter(isAllowed),
    })),
  )

  const toggleSubMenu = (name: string) => {
    expandedMenus.value[name] = !expandedMenus.value[name]
    sessionStorage.setItem('expandedMenus', JSON.stringify(expandedMenus.value))
  }

  const isActive = (name: string) => {
    if (route.meta.activeMenu) {
      return route.meta.activeMenu === name
    }
    return route.name === name
  }

  const isSubMenuActive = (children: MenuItemConfig[]) => {
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
