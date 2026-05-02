import {
  Home,
  Newspaper,
  Users,
  CirclePoundSterling,
  Baby,
  NotepadText,
  GalleryHorizontal,
  Ambulance,
  HandHeart,
  ShieldAlert,
} from 'lucide-vue-next'
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
    icon: HandHeart,
    label: 'Program Donasi',
    route: '/dashboard/donation-programs',
    roles: [ROLES.FINANCE],
  },
  {
    icon: CirclePoundSterling,
    label: 'Pemasukan',
    roles: [ROLES.FINANCE],
    children: [
      {
        label: 'Program Donasi',
        route: '/dashboard/income/donation-programs',
      },
      {
        label: 'Program Sosial',
        route: '/dashboard/income/social-programs',
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
        label: 'Program Donasi',
        route: '/dashboard/expenses/donation-programs',
      },
      {
        label: 'Program Sosial',
        route: '/dashboard/expenses/social-programs',
      },
      {
        label: 'Anak Asuh',
        route: '/dashboard/expenses/foster-children',
      },
    ],
  },
  {
    icon: CirclePoundSterling,
    label: 'Program Sosial',
    route: '/dashboard/social-programs',
    roles: [ROLES.SOCIAL_MANAGER],
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
    label: 'Berita',
    roles: [ROLES.PUBLICATION_MANAGER],
    route: '/dashboard/news',
  },
  {
    icon: ShieldAlert,
    label: 'Moderasi',
    roles: [ROLES.PUBLICATION_MANAGER],
    children: [
      {
        label: 'Komentar Berita',
        route: '/dashboard/moderation/comments',
      },
      {
        label: 'Doa',
        route: '/dashboard/moderation/prayers',
      },
    ],
  },
  {
    icon: GalleryHorizontal,
    label: 'Galeri',
    route: '/dashboard/galleries',
    roles: [ROLES.PUBLICATION_MANAGER],
  },
  {
    icon: Ambulance,
    label: 'Kelola Ambulans',
    route: '/dashboard/ambulance',
    roles: [ROLES.AMBULANCE_MANAGER],
  },
  {
    icon: Ambulance,
    label: 'Layanan Ambulans',
    route: '/dashboard/ambulance-services',
    roles: [ROLES.AMBULANCE_MANAGER],
  },
  {
    icon: NotepadText,
    label: 'Manajemen Program',
    roles: [ROLES.SOCIAL_MANAGER],
    children: [
      {
        label: 'Data Program',
        route: '/dashboard/social-programs',
      },
      {
        label: 'Riwayat Langganan',
        route: '/dashboard/social-programs/subscriptions',
      },
      {
        label: 'Riwayat Pelanggan',
        route: '/dashboard/social-programs/customers',
      },
    ],
  },
  {
    icon: NotepadText,
    label: 'Program Ketua',
    roles: [ROLES.CHAIRMAN],
    route: '/dashboard/social-programs',
  },
  {
    icon: Baby,
    label: 'Anak Asuh',
    roles: [ROLES.CHAIRMAN],
    route: '/dashboard/chairman/foster-children/submissions'
  }
]
