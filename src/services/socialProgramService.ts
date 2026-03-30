import type {
  SocialProgramListResponse,
  SocialProgramParams,
} from '@/types/socialprogram'

export const socialProgramService = {
  getSocialProgramList: async (
    params: SocialProgramParams,
  ): Promise<SocialProgramListResponse> => {
    // simulasi delay biar berasa API 😏
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      data: {
        programs: [
          {
            id: 1,
            name: 'Program Anak Hebat',
            total_subscriber: 120,
            status: 'active',
            created_at: '2025-01-01',
          },
          {
            id: 2,
            name: 'Program Peduli Lingkungan',
            total_subscriber: 80,
            status: 'pending',
            created_at: '2025-02-01',
          },
        ],
        pagination: {
          has_next: false,
          has_prev: false,
        },
      },
    }
  },
}