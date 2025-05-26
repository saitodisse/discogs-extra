import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Artist, Label, MasterRelease, Release } from 'disconnect'

type DiscogsEntity =
  | {
      type: 'artist'
      data: Artist
    }
  | {
      type: 'master'
      data: MasterRelease
    }
  | {
      type: 'release'
      data: Release
    }
  | {
      type: 'label'
      data: Label
    }

interface BreadcrumbDiscogsProps {
  entity: DiscogsEntity
  showReleases?: boolean
}

export function BreadcrumbDiscogs({ entity, showReleases }: BreadcrumbDiscogsProps) {
  const renderBreadcrumb = () => {
    const items = [
      // Always show Discogs root
      <BreadcrumbItem key="discogs">
        <BreadcrumbLink href="/discogs">discogs</BreadcrumbLink>
      </BreadcrumbItem>,
    ]

    // Add intermediate items based on entity type
    switch (entity.type) {
      case 'artist':
        items.push(
          <BreadcrumbItem key="artist">
            <BreadcrumbLink href={`/discogs/artists/${entity.data.id}`}>
              Artist
              <span className="font-mono"> ({entity.data.id})</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
        )
        break

      case 'master':
        // Add artist link if available
        if (entity.data.artists?.[0]) {
          items.push(
            <BreadcrumbItem key="artist">
              <BreadcrumbLink href={`/discogs/artists/${entity.data.artists[0].id}`}>
                Artist
                <span className="font-mono"> ({entity.data.artists[0].id})</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
          )
        }

        // Add master link
        items.push(
          <BreadcrumbItem key="master">
            <BreadcrumbLink href={`/discogs/masters/${entity.data.id}`}>
              Master
              <span className="font-mono"> ({entity.data.id})</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
        )

        // Add releases link if requested
        if (showReleases) {
          items.push(
            <BreadcrumbItem key="releases">
              <BreadcrumbLink href={`/discogs/masters/${entity.data.id}/releases`}>
                All Releases
              </BreadcrumbLink>
            </BreadcrumbItem>
          )
        }
        break

      case 'release':
        // Add artist link if available
        if (entity.data.artists?.[0]) {
          items.push(
            <BreadcrumbItem key="artist">
              <BreadcrumbLink href={`/discogs/artists/${entity.data.artists[0].id}`}>
                {entity.data.artists[0].name}
                <span className="font-mono"> ({entity.data.artists[0].id})</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
          )
        }

        // Add master link if available
        if (entity.data.master_id) {
          items.push(
            <BreadcrumbItem key="master">
              <BreadcrumbLink href={`/discogs/masters/${entity.data.master_id}`}>
                Master
                <span className="font-mono"> ({entity.data.master_id})</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
          )
        }

        // Add release link
        items.push(
          <BreadcrumbItem key="release">
            <BreadcrumbLink href={`/discogs/releases/${entity.data.id}`}>
              Release
              <span className="font-mono"> ({entity.data.id})</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
        )
        break

      case 'label':
        items.push(
          <BreadcrumbItem key="label">
            <BreadcrumbLink href={`/discogs/labels/${entity.data.id}`}>
              Label: {entity.data.name}
              <span className="font-mono"> ({entity.data.id})</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
        )
        break
    }

    // Insert separators between items
    return items.reduce((acc: React.ReactNode[], item, i) => {
      if (i === 0) return [item]
      return [...acc, <BreadcrumbSeparator key={`sep-${i}`} />, item]
    }, [])
  }

  return (
    <Breadcrumb className="my-4">
      <BreadcrumbList>{renderBreadcrumb()}</BreadcrumbList>
    </Breadcrumb>
  )
}
