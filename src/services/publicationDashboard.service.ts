import { newsService } from './news.service'
import { galleryService } from './gallery.service'
import { newsCommentService } from './newsComment.service'
import { prayerService } from './prayer.service'

export interface PublicationDashboardStats {
  news: {
    draft: number
    published: number
    archived: number
    total: number
  }
  gallery: {
    draft: number
    published: number
    archived: number
    total: number
  }
  reportedComments: number
  reportedPrayers: number
}

export const publicationDashboardService = {
  getStats: async (): Promise<PublicationDashboardStats> => {
    const [
      newsDraft,
      newsPublished,
      newsArchived,
      galleryDraft,
      galleryPublished,
      galleryArchived,
      reportedComments,
      reportedPrayers,
    ] = await Promise.all([
      newsService.getNewsList({ limit: 1, status: 'draft' as any }).catch(() => ({ data: { pagination: { total: 0 } } })),
      newsService.getNewsList({ limit: 1, status: 'published' as any }).catch(() => ({ data: { pagination: { total: 0 } } })),
      newsService.getNewsList({ limit: 1, status: 'archived' as any }).catch(() => ({ data: { pagination: { total: 0 } } })),
      galleryService.getGalleryList({ limit: 1, status: 'draft' as any }).catch(() => ({ data: { pagination: { total: 0 } } })),
      galleryService.getGalleryList({ limit: 1, status: 'published' as any }).catch(() => ({ data: { pagination: { total: 0 } } })),
      galleryService.getGalleryList({ limit: 1, status: 'archived' as any }).catch(() => ({ data: { pagination: { total: 0 } } })),
      newsCommentService.getAdminNewsComments({ limit: 1 }).catch(() => ({ data: { pagination: { total: 0 } } })),
      prayerService.getAdminPrayers({ limit: 1 }).catch(() => ({ data: { pagination: { total: 0 } } })),
    ])

    const nDraft = newsDraft.data?.pagination?.total || 0
    const nPub = newsPublished.data?.pagination?.total || 0
    const nArc = newsArchived.data?.pagination?.total || 0

    const gDraft = galleryDraft.data?.pagination?.total || 0
    const gPub = galleryPublished.data?.pagination?.total || 0
    const gArc = galleryArchived.data?.pagination?.total || 0

    return {
      news: {
        draft: nDraft,
        published: nPub,
        archived: nArc,
        total: nDraft + nPub + nArc,
      },
      gallery: {
        draft: gDraft,
        published: gPub,
        archived: gArc,
        total: gDraft + gPub + gArc,
      },
      reportedComments: reportedComments.data?.pagination?.total || 0,
      reportedPrayers: reportedPrayers.data?.pagination?.total || 0,
    }
  },
}
