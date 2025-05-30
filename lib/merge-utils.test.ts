import { mergeTracks } from './merge-utils'
import { debug_saveJsonToTmp } from '../app/discogs/masters/[master_id]/save/actions'
import { Track } from 'disconnect'

describe('mergeTracks', () => {
  it('should return empty array when both inputs are undefined', async () => {
    expect(await mergeTracks(undefined, undefined)).toEqual([])
  })

  it('should return updatedTracks when originalTracks is undefined', async () => {
    const updatedTracks: Track[] = [
      {
        position: 'A1',
        type_: 'track',
        title: 'Dá Sorte',
        duration: '',
      },
    ]
    expect(await mergeTracks(undefined, updatedTracks)).toEqual(updatedTracks)
  })

  it('should return originalTracks when updatedTracks is undefined', async () => {
    const originalTracks: Track[] = [
      {
        position: 'A1',
        type_: 'track',
        title: 'Dá Sorte',
        duration: '',
      },
    ]
    expect(await mergeTracks(originalTracks, undefined)).toEqual(originalTracks)
  })

  it('should merge tracks and mark new tracks as extra_track', async () => {
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

    expect(await mergeTracks(originalTracks, updatedTracks)).toEqual(expected)
  })

  it('should not merge tracks if only changes title', async () => {
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

    expect(await mergeTracks(originalTracks, updatedTracks)).toEqual(expected)
  })

  it('should not merge tracks if title is the same but not position', async () => {
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
        position: '2',
        type_: 'track',
        title: 'Track 2',
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

    expect(await mergeTracks(originalTracks, updatedTracks)).toEqual(expected)
  })

  it('should update existing track if updated track has more extra artists', async () => {
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

    expect(await mergeTracks(originalTracks, updatedTracks)).toEqual(expected)
  })

  it('should keep original track if it has more or equal extra artists', async () => {
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

    expect(await mergeTracks(originalTracks, updatedTracks)).toEqual(originalTracks)
  })
})

// describe('discogsSite_getCredits', () => {
//   it('should GET json directly from Discogs Site', async () => {
//     const credits = await discogsSite_getCredits({
//       artistId: 449858, // Zuza Homem de Mello
//     })

//     await debug_saveJsonToTmp({
//       data: credits,
//       filename: 'zuza_homem_de_mello_credits.json',
//       lastPath: 'discogs-site_getCredits',
//     })

//     expect(credits).toBeDefined()
//   })
// })
