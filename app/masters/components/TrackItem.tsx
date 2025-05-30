'use client'

import { Track } from 'disconnect'
import Link from 'next/link'

export interface TrackItemProps {
  track: Track
  className?: string
}

export function TrackItem({ track, className }: TrackItemProps) {
  return (
    <div className={`${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-grow flex-col">
          <div className="flex items-center">
            <span className="mr-2 w-8 font-mono text-muted-foreground">{track.position}</span>
            <span className="font-medium">{track.title}</span>
            {track.duration && (
              <span className="ml-2 text-muted-foreground">({track.duration})</span>
            )}
          </div>

          {/* Track Artists */}
          {track.artists && track.artists.length > 1 && (
            <div className="ml-10 flex flex-wrap gap-2 text-sm text-muted-foreground">
              {track.artists.map((artist, artistIndex: number) => (
                <div
                  key={artistIndex}
                  className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-muted-foreground"
                >
                  {artist?.role && <span className="">{artist.role}:</span>}
                  <Link
                    href={`/discogs/artists/${artist.id}`}
                    className="text-foreground/70 hover:underline"
                  >
                    {artist.name}
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* sub_tracks */}
          {track.sub_tracks && track.sub_tracks.length > 0 && (
            <div className="ml-10">
              {track.sub_tracks.map((subTrack, subTrackIndex: number) => (
                <TrackItem key={subTrackIndex} track={subTrack} className="py-0.5 text-sm" />
              ))}
            </div>
          )}

          {/* Track Extra Artists */}
          {track.extraartists && track.extraartists.length > 0 && (
            <div className="ml-10 text-sm text-muted-foreground">
              {track.extraartists.map((artist, artistIndex: number) => (
                <div
                  key={artistIndex}
                  className="*: flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-muted-foreground"
                >
                  {artist?.role && <span className="">{artist.role}:</span>}
                  <Link
                    href={`/discogs/artists/${artist.id}`}
                    className="text-foreground/70 hover:underline"
                  >
                    {artist.name}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
