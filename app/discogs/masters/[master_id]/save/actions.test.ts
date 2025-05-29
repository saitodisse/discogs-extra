import { ReleaseDb } from '@/types/ReleaseDb'
import { mergeTracks } from './actions'
import { Track } from 'disconnect'

describe('mergeTracks', () => {
  it('should return empty array when both inputs are undefined', () => {
    expect(mergeTracks(undefined, undefined)).toEqual([])
  })

  it('should return updatedTracks when originalTracks is undefined', () => {
    const updatedTracks: Track[] = [
      {
        position: 'A1',
        type_: 'track',
        title: 'Dá Sorte',
        duration: '',
      },
    ]
    expect(mergeTracks(undefined, updatedTracks)).toEqual(updatedTracks)
  })

  it('should return originalTracks when updatedTracks is undefined', () => {
    const originalTracks: Track[] = [
      {
        position: 'A1',
        type_: 'track',
        title: 'Dá Sorte',
        duration: '',
      },
    ]
    expect(mergeTracks(originalTracks, undefined)).toEqual(originalTracks)
  })

  it('should merge tracks and mark new tracks as extra_track', () => {
    const originalTracks: Track[] = [
      {
        position: 'A1',
        type_: 'track',
        title: 'Track 1',
        duration: '',
        extraartists: [],
      },
      {
        position: 'A2',
        type_: 'track',
        title: 'Track 2',
        duration: '',
        extraartists: [],
      },
    ]
    const updatedTracks: Track[] = [
      {
        position: 'A2',
        type_: 'track',
        title: 'Track 2',
        duration: '',
        extraartists: [],
      },
      {
        position: 'A3',
        type_: 'track',
        title: 'Track 3',
        duration: '',
        extraartists: [],
      },
    ]

    const expected: Track[] = [
      {
        position: 'A1',
        type_: 'track',
        title: 'Track 1',
        duration: '',
        extraartists: [],
      },
      {
        position: 'A2',
        type_: 'track',
        title: 'Track 2',
        duration: '',
        extraartists: [],
      },
      {
        position: 'A3',
        type_: 'track',
        title: 'Track 3',
        duration: '',
        extraartists: [],
        extra_track: true,
      },
    ]

    expect(mergeTracks(originalTracks, updatedTracks)).toEqual(expected)
  })

  it('should not merge tracks if only changes title', () => {
    const originalTracks: Track[] = [
      {
        position: 'A2',
        type_: 'track',
        title: 'Track 2',
        duration: '',
        extraartists: [],
      },
    ]
    const updatedTracks: Track[] = [
      {
        position: 'A2',
        type_: 'track',
        title: 'Track 2 (OTHER NAME)',
        duration: '',
        extraartists: [],
      },
    ]

    const expected: Track[] = [
      {
        position: 'A2',
        type_: 'track',
        title: 'Track 2',
        duration: '',
        extraartists: [],
      },
    ]

    expect(mergeTracks(originalTracks, updatedTracks)).toEqual(expected)
  })

  it('should update existing track if updated track has more extra artists', () => {
    const originalTracks: Track[] = [
      {
        position: 'A1',
        type_: 'track',
        title: 'Track 1',
        duration: '',
        extraartists: [],
      },
    ]
    const updatedTracks: Track[] = [
      {
        position: 'A1',
        type_: 'track',
        title: 'Track 1',
        duration: '',
        extraartists: [
          {
            name: 'Carlos Imperial',
            anv: '',
            join: '',
            role: 'Composed By',
            tracks: '',
            id: 736513,
            resource_url: 'https://api.discogs.com/artists/736513',
          },
        ],
      },
    ]

    const expected = [
      {
        position: 'A1',
        type_: 'track',
        title: 'Track 1',
        duration: '',
        extraartists: [
          {
            name: 'Carlos Imperial',
            anv: '',
            join: '',
            role: 'Composed By',
            tracks: '',
            id: 736513,
            resource_url: 'https://api.discogs.com/artists/736513',
          },
        ],
      },
    ]

    expect(mergeTracks(originalTracks, updatedTracks)).toEqual(expected)
  })

  it('should keep original track if it has more or equal extra artists', () => {
    const originalTracks: Track[] = [
      {
        position: 'A1',
        type_: 'track',
        title: 'Track 1',
        extraartists: [
          {
            name: 'Carlos Imperial',
            anv: '',
            join: '',
            role: 'Composed By',
            tracks: '',
            id: 736513,
            resource_url: 'https://api.discogs.com/artists/736513',
          },
          {
            name: 'Elis Regina',
            anv: '',
            join: '',
            role: 'Vocals',
            tracks: '',
            id: 30703,
            resource_url: 'https://api.discogs.com/artists/30703',
          },
        ],
      },
    ]
    const updatedTracks: Track[] = [
      {
        position: 'A1',
        type_: 'track',
        title: 'Track 1',
        extraartists: [
          {
            name: 'Elis Regina',
            anv: '',
            join: '',
            role: 'Vocals',
            tracks: '',
            id: 30703,
            resource_url: 'https://api.discogs.com/artists/30703',
          },
        ],
      },
    ]

    expect(mergeTracks(originalTracks, updatedTracks)).toEqual(originalTracks)
  })
})
