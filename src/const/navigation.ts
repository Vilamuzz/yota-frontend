import { Home, Newspaper, Users, CirclePoundSterling, Baby, NotepadText } from 'lucide-vue-next'
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
  {
    icon: NotepadText,
    label: 'Manajemen Program',
    roles: [ROLES.SOCIAL_MANAGER],
    children: [
      {
        label: 'Data Program',
        route: '/dashboard/social-program',
      },
      {
        label: 'Riwayat Langganan',
        route: '/dashboard/social-program/subscriptions',
      },
      {
        label: 'Riwayat Pelanggan',
        route: '/dashboard/social-program/customers',
      },
    ],
  },
  {
    icon: NotepadText,
    label: 'Manajemen Program',
    roles: [ROLES.CHAIRMAN],
    route: '/dashboard/chairman/social-program',
  },
]
