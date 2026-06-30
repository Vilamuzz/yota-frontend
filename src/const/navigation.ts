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
  Settings,
  Building2,
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
    icon: Building2,
    label: 'Profil Yayasan',
    route: '/dashboard/foundation-profile',
    roles: [ROLES.SUPERADMIN],
  },
  {
    icon: Settings,
    label: 'Pengaturan',
    route: '/dashboard/settings',
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
    label: 'Riwayat Donasi',
    roles: [ROLES.FINANCE],
    route: '/dashboard/donation-programs/income',
  },
  {
  icon: CirclePoundSterling,
  label: 'Pemasukan Program Sosial',
  roles: [ROLES.FINANCE],
  route: '/dashboard/income/social-programs',
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
    roles: [ROLES.SOCIAL_MANAGER],
    children: [
      {
        label: 'Data Program',
        route: '/dashboard/social-programs',
      },
      {
        label: 'Daftar Program Langganan',
        route: '/dashboard/social-programs/subscriptions',
      },
      {
        label: 'Daftar Pelanggan',
        route: '/dashboard/social-programs/subscribers',
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
        route: '/dashboard/foster-children/candidates',
      },
      {
        label: 'Riwayat Donasi Anak Asuh',
        route: '/dashboard/foster-children/income',
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
    route: '/dashboard/ambulances',
    roles: [ROLES.AMBULANCE_MANAGER],
  },
  {
    icon: Ambulance,
    label: 'Layanan Ambulans',
    route: '/dashboard/ambulances/services',
    roles: [ROLES.AMBULANCE_MANAGER],
  },
  {
    icon: Ambulance,
    label: 'Layanan Ambulans',
    route: '/dashboard/ambulances/assigned',
    roles: [ROLES.AMBULANCE_DRIVER],
  },
  {
    icon: Ambulance,
    label: 'Riwayat Ambulans',
    route: '/dashboard/ambulances/histories',
    roles: [ROLES.AMBULANCE_MANAGER],
  },
  {
    icon: Ambulance,
    label: 'Riwayat Ambulans',
    route: '/dashboard/ambulances/histories/detail',
    roles: [ROLES.AMBULANCE_DRIVER],
  },
  {
    icon: NotepadText,
    label: 'Manajemen Program',
    roles: [ROLES.CHAIRMAN],
    route: '/dashboard/social-programs',
  },
  {
    icon: Baby,
    label: 'Anak Asuh',
    roles: [ROLES.CHAIRMAN],
    route: '/dashboard/foster-children/candidates',
  },
]
