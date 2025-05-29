import { Track } from 'disconnect'

export function mergeTracks(originalTracks: Track[] = [], updatedTracks: Track[] = []) {
  if (!originalTracks) return updatedTracks || []
  if (!updatedTracks) return originalTracks

  // If we're starting with an empty array, return updatedTracks without extra_track flag
  if (originalTracks.length === 0) return [...updatedTracks]

  const mergedTracks = [...originalTracks]

  updatedTracks.forEach((updatedTrack) => {
    const existingIndex = mergedTracks.findIndex((track) => track.title === updatedTrack.title)

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
      const hasMoreExtraArtists = (track: Track) =>
        (track.extraartists?.length || 0) > (existingTrack.extraartists?.length || 0)

      if (hasMoreExtraArtists(updatedTrack)) {
        mergedTracks[existingIndex] = updatedTrack
      }
    }
  })

  return mergedTracks
}
