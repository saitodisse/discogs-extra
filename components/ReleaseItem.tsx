import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ReleaseItemProps {
  id: number
  title: string
  type?: 'release' | 'master' | 'artist' | 'label'
  thumb?: string
  cover_image?: string
  year?: number | string
  format?: string | string[]
  label?: string | string[]
  compact?: boolean
}

export function ReleaseItem({
  id,
  title,
  type = 'release',
  thumb,
  cover_image,
  year,
  format,
  label,
  compact = false,
}: ReleaseItemProps) {
  const url = getUrl({ id, type })

  return (
    <Link href={url} className="block">
      <Card className="h-full transition-colors hover:bg-accent/50">
        {!compact && (
          <CardHeader>
            <CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className={compact ? 'p-0' : undefined}>
          <div className="mb-3 aspect-square overflow-hidden rounded-md bg-muted">
            {thumb || cover_image ? (
              <Image
                src={thumb || cover_image || ''}
                alt={title}
                width={300}
                height={300}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>
          <div className={compact ? 'p-2' : undefined}>
            <div className="mb-2 text-xs text-muted-foreground">
              {year && <Badge>{year}</Badge>}
            </div>
            {compact && <h2 className="mb-1 line-clamp-3 text-xs">{title}</h2>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function getUrl(item: { id: number; type: string }): string {
  if (item.type === 'artist') {
    return `/discogs/artists/${item.id}`
  }
  if (item.type === 'label') {
    return `/discogs/labels/${item.id}`
  }
  if (item.type === 'master') {
    return `/discogs/masters/${item.id}`
  }
  // Default to release if no type matches
  return `/discogs/releases/${item.id}`
}
