import { Image, Track, Video } from 'disconnect'

interface RoleDetail {
  role: string
  tracks?: string
}

interface ExtraArtist {
  id: number
  name: string
  anv?: string
  resource_url?: string
  roles: RoleDetail[]
}

interface ReleaseIdEntry {
  id: number
  country: string | null
  year_of_release: number | null
}

export interface DbOperationResult {
  success: boolean
  error?: Error
  message?: string
}

export interface ReleaseDb {
  // Basic fields
  id: string // UUID format

  owner_id: string // UUID format
  owner_email: string

  created_at: string // ISO date format
  updated_at: string // ISO date format

  master_id: number
  releases_ids: number[]

  artists_id: number[]
  artists_name: string[]

  title: string
  status?: string
  data_quality: string
  country?: string
  year_of_release?: number
  notes?: string

  companies_json: any // JSONB field
  extraartists_json: ExtraArtist[]
  formats_json: any // JSONB field
  genres: string[]
  styles: string[]
  identifiers_json: any // JSONB field
  images_json: Image[]
  series_json: any // JSONB field
  videos_json: Video[]
  tracklist_json: Track[]
}
