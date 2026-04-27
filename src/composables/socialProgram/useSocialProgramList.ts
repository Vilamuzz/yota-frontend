import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { socialProgramService } from '@/services/socialProgram.service'
import type { SocialProgramParams } from '@/types/socialProgram'


// ✅ Data dummy
const DUMMY_PROGRAMS = [
  {
    id: 1,
    name: 'Beasiswa Anak Yatim',
    total_subscriber: 120,
    minimum_nominal: 50000,
    status: 'active',
    submission_status: 'Disetujui',
    created_at: '2024-11-01T00:00:00Z',
    description: 'Program beasiswa untuk anak yatim piatu.',
    due_date: '2025-12-31T00:00:00Z',
  },
  {
    id: 2,
    name: 'Bantuan Sembako',
    total_subscriber: 85,
    minimum_nominal: 25000,
    status: 'pending',
    submission_status: 'Diajukan',
    created_at: '2024-12-15T00:00:00Z',
    description: 'Distribusi sembako untuk keluarga kurang mampu.',
    due_date: '2025-06-30T00:00:00Z',
  },
  {
    id: 3,
    name: 'Rumah Singgah',
    total_subscriber: 40,
    minimum_nominal: 100000,
    status: 'active',
    submission_status: 'Draft',
    created_at: '2025-01-10T00:00:00Z',
    description: 'Penyediaan rumah singgah bagi tunawisma.',
    due_date: '2025-09-01T00:00:00Z',
  },
  {
    id: 4,
    name: 'Kelas Mengaji Gratis',
    total_subscriber: 200,
    minimum_nominal: 10000,
    status: 'completed',
    submission_status: 'Ditolak',
    created_at: '2025-02-20T00:00:00Z',
    description: 'Program kelas mengaji gratis untuk anak-anak.',
    due_date: '2025-03-01T00:00:00Z',
  },
]

export const useSocialProgramList = (params: MaybeRefOrGetter<SocialProgramParams>) => {
  const socialProgramListError = ref('')

  const socialProgramListQuery = useQuery({
    queryKey: ['socialprograms', params],
    queryFn: async () => {
      // ✅ Simulasi delay network biar terasa realistis
      await new Promise((resolve) => setTimeout(resolve, 600))

      // ✅ Return struktur yang sama seperti API nanti
      return {
        data: {
          programs: DUMMY_PROGRAMS,
          pagination: {
            has_next: false,
            has_prev: false,
            next_cursor: undefined,
            prev_cursor: undefined,
          },
        },
      }
    },
    retry: 1,
  })

  return {
    socialProgramListError,
    socialProgramListQuery,
  }
}
