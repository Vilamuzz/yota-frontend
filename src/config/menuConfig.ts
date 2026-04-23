import type { Component } from 'vue'
import { Home, Newspaper, Users, CirclePoundSterling } from 'lucide-vue-next'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChildren } from '@fortawesome/free-solid-svg-icons'
import { h } from 'vue'

export interface MenuItemConfig {
  icon?: Component
  label: string
  name: string
  path?: string
  roles?: string[]
  children?: MenuItemConfig[]
}

export const menuConfig: MenuItemConfig[] = [
  {
    icon: Home,
    label: 'Dashboard',
    name: 'dashboard',
    path: '/dashboard',
  },
  {
    icon: Users,
    label: 'Users',
    name: 'users',
    path: '/dashboard/users',
    roles: ['superadmin'],
  },
  {
    icon: Users,
    label: 'Donasi',
    name: 'dashboard-donations',
    path: '/dashboard/donations',
    roles: ['finance'],
  },
  {
    icon: CirclePoundSterling,
    label: 'Pemasukan',
    name: 'income',
    roles: ['finance'],
    children: [
      {
        label: 'Donasi',
        name: 'dashboard-donation-income',
        path: '/dashboard/income/donation',
      },
      {
        label: 'Program Sosial',
        name: 'social-program',
        path: '/dashboard/income/social-program',
      },
      {
        label: 'Anak Asuh',
        name: 'foster-children',
        path: '/dashboard/income/foster-children',
      },
    ],
  },
  {
    icon: CirclePoundSterling,
    label: 'Pengeluaran',
    name: 'expense',
    roles: ['finance'],
    children: [
      {
        label: 'Donasi',
        name: 'dashboard-donation-expense',
        path: '/dashboard/expense/donation',
      },
    ],
  },
  {
    icon: h(FontAwesomeIcon, { icon: faChildren }),
    label: 'Anak Asuh',
    name: 'foster-children',
    roles: ['social_manager'],
    children: [
      {
        label: 'Data Anak Asuh',
        name: 'dashboard-foster-children',
        path: '/dashboard/foster-children',
      },
      {
        label: 'Ajuan Anak Asuh',
        name: 'dashboard-foster-children-submissions',
        path: '/dashboard/foster-children/submissions',
      },
      {
        label: 'Riwayat Donasi Anak Asuh',
        name: 'dashboard-foster-children-donations',
        path: '/dashboard/foster-children/donations',
      },
    ],
  },
  {
    icon: Newspaper,
    label: 'News',
    name: 'news',
    roles: ['publication_manager'],
    path: '/dashboard/news',
  },
  {
  icon: h(FontAwesomeIcon, { icon: faChildren }),
  label: 'Anak Asuh',
  name: 'chairman-foster-children-submissions',
  roles: ['chairman'],
  path: '/dashboard/chairman/foster-children/submissions',
  }
]
