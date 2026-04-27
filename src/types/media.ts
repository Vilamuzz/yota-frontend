export interface Media {
  id: string
  newsId: string
  galleryId: string
  type: MediaType
  url: string
  alt: string
  order: number
}

export enum MediaType {
  Image = 'image',
  Video = 'video',
}

export enum MediaCategory {
  SocialEvent = 'social-event',
  Disaster = 'disaster',
  Health = 'health',
  Environment = 'environment',
  Others = 'others',
}

export enum MediaStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}
