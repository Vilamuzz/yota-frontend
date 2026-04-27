import { Home, Newspaper, Users, CirclePoundSterling, Baby } from 'lucide-vue-next'
import type { NavItem } from '@/types/navigation'
import { ROLES } from './roles'

export const dashboardNavigation: NavItem[] = [
  {
    icon: Home,
    label: 'Dashboard',
    route: '/dashboard',
  },
  {
    icon: Users,
    label: 'Pengguna',
    route: '/dashboard/accounts',
    roles: [ROLES.SUPERADMIN],
  },
  {
    icon: Users,
    label: 'Donasi',
    route: '/dashboard/donations',
    roles: [ROLES.FINANCE],
  },
  {
    icon: CirclePoundSterling,
    label: 'Pemasukan',
    roles: [ROLES.FINANCE],
    children: [
      {
        label: 'Donasi',
        route: '/dashboard/income/donation',
      },
      {
        label: 'Program Sosial',
        route: '/dashboard/income/social-program',
      },
      {
        label: 'Anak Asuh',
        route: '/dashboard/income/foster-children',
      },
    ],
  },
  {
    icon: CirclePoundSterling,
    label: 'Pengeluaran',
    roles: [ROLES.FINANCE],
    children: [
      {
        label: 'Donasi',
        route: '/dashboard/expense/donation',
      },
      {
        label: 'Program Sosial',
        route: '/dashboard/expense/social-program',
      },
      {
        label: 'Anak Asuh',
        route: '/dashboard/expense/foster-children',
      },
    ],
  },
  {
    icon: Baby,
    label: 'Anak Asuh',
    roles: [ROLES.SOCIAL_MANAGER],
    children: [
      {
        label: 'Data Anak Asuh',
        route: '/dashboard/foster-children',
      },
      {
        label: 'Ajuan Anak Asuh',
        route: '/dashboard/foster-children/submissions',
      },
      {
        label: 'Riwayat Donasi Anak Asuh',
        route: '/dashboard/foster-children/donations',
      },
    ],
  },
  {
    icon: Newspaper,
    label: 'News',
    roles: [ROLES.PUBLICATION_MANAGER],
    route: '/dashboard/news',
  },
]
