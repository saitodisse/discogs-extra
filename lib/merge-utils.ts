import { Track } from 'disconnect'
import { ReleaseDb } from '../types/ReleaseDb'

// Helper functions for merging data
export const mergeJsonIfLarger = (original: any, updated: any) => {
  if (!original) return updated
  if (!updated) return original

  const originalStr = JSON.stringify(original)
  const updatedStr = JSON.stringify(updated)

  return updatedStr.length > originalStr.length ? updated : original
}

export async function mergeTracks(
  originalTracks?: Track[],
  updatedTracks?: Track[]
): Promise<Track[]> {
  if (!originalTracks && !updatedTracks) return []
  if (!originalTracks) return [...(updatedTracks || [])]
  if (!updatedTracks) return [...originalTracks]

  const mergedTracks = [...originalTracks]

  updatedTracks.forEach((updatedTrack) => {
    const existingIndex = mergedTracks.findIndex(
      (track) => track.title === updatedTrack.title || track.position === updatedTrack.position
    )

    if (existingIndex === -1) {
      // New track, add it
      // Only mark as extra_track if it has a different position or the title isn't just a variant
      const isVariantTitle = originalTracks.some(
        (track) =>
          track.title.includes(updatedTrack.title) || updatedTrack.title.includes(track.title)
      )
      if (!isVariantTitle) {
        mergedTracks.push({ ...updatedTrack, extra_track: true })
      }
    } else {
      // Existing track, check if we should update it
      const existingTrack = mergedTracks[existingIndex]

      // get JSON size from extraartists
      const originalJsonSize = JSON.stringify(existingTrack?.extraartists || '{}')?.length
      const updatedJsonSize = JSON.stringify(updatedTrack?.extraartists || '{}')?.length
      if (updatedJsonSize > originalJsonSize) {
        // Update existing track with larger JSON size
        mergedTracks[existingIndex] = {
          ...existingTrack,
          extraartists: updatedTrack.extraartists,
        }
      }

      // merge extra artists if they exist
      if (updatedTrack.extraartists && updatedTrack.extraartists.length > 0) {
        updatedTrack.extraartists = [
          ...(existingTrack.extraartists || []),
          ...(updatedTrack.extraartists || []),
        ]
      }
    }
  })

  return Promise.resolve(mergedTracks)
}

// Function to merge release data
export const mergeTracksData = async (
  master: ReleaseDb,
  newRelease: any // Using any here since this could come from different sources
): Promise<ReleaseDb> => {
  // Get existing release IDs or initialize empty array
  const releases_ids = master?.releases_ids || []

  // Check if this release is already included
  if (!releases_ids.some((r) => r === newRelease.id)) {
    releases_ids.push(newRelease.id)
  }

  return {
    ...master,
    releases_ids,
    tracklist_json: await mergeTracks(master?.tracklist_json || [], newRelease.tracklist || []),
  }
}

// Function to merge extra artists data
export const mergeExtraArtistsData = async (master: ReleaseDb, releases: any[]) => {
  const extraArtistsMap = new Map<number, ReleaseDb['extraartists_json'][0]>()

  // Initialize from master's existing extraartists_json if any
  if (master.extraartists_json) {
    for (const artist of master.extraartists_json) {
      if (artist.id !== undefined) {
        extraArtistsMap.set(artist.id, {
          ...artist,
          roles: [...artist.roles],
        })
      }
    }
  }

  function addOrUpdateCredit(
    artistId: number,
    artistName: string,
    artistAnv: string | undefined,
    artistResourceUrl: string | undefined,
    role: string,
    trackInfo?: string
  ) {
    if (!role) return

    const newRoleDetail: ReleaseDb['extraartists_json'][0]['roles'][0] = {
      role,
    }
    if (trackInfo?.trim()) {
      newRoleDetail.tracks = trackInfo.trim()
    }

    let existingArtist = extraArtistsMap.get(artistId)

    if (existingArtist) {
      // Artist exists, check if this role/track combination is new
      const roleExists = existingArtist.roles.some(
        (r) => r.role === newRoleDetail.role && r.tracks === newRoleDetail.tracks
      )
      if (!roleExists) {
        existingArtist.roles.push(newRoleDetail)
      }
      // Update if new data is more complete
      if (!existingArtist.name && artistName) existingArtist.name = artistName
      if (!existingArtist.anv && artistAnv) existingArtist.anv = artistAnv
      if (!existingArtist.resource_url && artistResourceUrl) {
        existingArtist.resource_url = artistResourceUrl
      }
    } else {
      // New artist
      existingArtist = {
        id: artistId,
        name: artistName,
        anv: artistAnv,
        resource_url: artistResourceUrl,
        roles: [newRoleDetail],
      }
      extraArtistsMap.set(artistId, existingArtist)
    }
  }

  for (const release of releases) {
    if (!release) continue

    // Process release-level extraartists
    if (release.extraartists) {
      for (const extraArtist of release.extraartists) {
        if (extraArtist.id) {
          addOrUpdateCredit(
            extraArtist.id,
            extraArtist.name,
            extraArtist.anv,
            extraArtist.resource_url,
            extraArtist.role || '',
            extraArtist.tracks
          )
        }
      }
    }

    // Process track-level extraartists
    if (release.tracklist) {
      for (const track of release.tracklist) {
        if (track.extraartists) {
          for (const trackArtist of track.extraartists) {
            if (trackArtist.id) {
              const trackIdentifier = track.position || track.title
              addOrUpdateCredit(
                trackArtist.id,
                trackArtist.name,
                trackArtist.anv,
                trackArtist.resource_url,
                trackArtist.role || '',
                trackIdentifier
              )
            }
          }
        }
      }
    }
  }

  // Sort artists and their roles
  const sortedArtists = Array.from(extraArtistsMap.values())
  sortedArtists.sort((a, b) => a.name.localeCompare(b.name))
  sortedArtists.forEach((artist) => {
    if (artist.roles) {
      artist.roles.sort((a, b) => {
        if (a.role === b.role) {
          return (a.tracks || '').localeCompare(b.tracks || '')
        }
        return a.role.localeCompare(b.role)
      })
    }
  })

  return {
    ...master,
    extraartists_json: sortedArtists,
  }
}
