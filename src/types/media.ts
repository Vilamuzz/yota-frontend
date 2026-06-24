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
  SocialEvent = 'kegiatan sosial',
  Disaster = 'bencana alam',
  Health = 'kesehatan',
  Environment = 'lingkungan',
  Others = 'lainnya',
}

export enum MediaStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface MediaRequest {
  file: File
  alt: string
}
