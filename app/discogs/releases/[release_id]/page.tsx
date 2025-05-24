import { Client } from "disconnect";
import { NextPage } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface ReleasePageProps {
  params: {
    release_id: string;
  };
}

interface Release {
  id: number;
  title: string;
  artists: Array<{
    name: string;
    id: number;
  }>;
  labels: Array<{
    name: string;
    id: number;
    catno: string;
  }>;
  year?: number;
  country?: string;
  genres?: string[];
  styles?: string[];
  formats?: Array<{
    name: string;
    qty: number;
    descriptions?: string[];
  }>;
  images?: Array<{
    uri: string;
    height: number;
    width: number;
  }>;
  videos?: Array<{
    uri: string;
    title: string;
    description: string;
  }>;
  notes?: string;
  tracklist: Array<{
    position: string;
    title: string;
    duration: string;
    artists?: Array<{
      name: string;
      id: number;
    }>;
  }>;
  uri: string;
  identifiers?: Array<{
    type: string;
    value: string;
  }>;
}

const ReleasePage: NextPage<ReleasePageProps> = async ({ params }) => {
  if (
    !process.env.DISCOGS_CONSUMER_KEY ||
    !process.env.DISCOGS_CONSUMER_SECRET
  ) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>
          Missing required API credentials. Please check your environment
          variables.
        </p>
      </div>
    );
  }

  const client = new Client({
    method: "discogs",
    consumerKey: process.env.DISCOGS_CONSUMER_KEY,
    consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
  });

  try {
    const release = await client
      .database()
      .getRelease(parseInt(params.release_id));

    return (
      <div className="container mx-auto p-4">
        <Card className="w-full">
          <div className="grid md:grid-cols-[300px_1fr] gap-6 p-6">
            {/* Release Cover */}
            <div className="aspect-square bg-muted relative rounded-lg overflow-hidden">
              {release.images && release.images[0] ? (
                <img
                  src={release.images[0].uri}
                  alt={release.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>

            {/* Release Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{release.title}</h1>

              <div className="mb-4">
                {release.artists &&
                  release.artists.map((artist, index) => (
                    <Link
                      key={artist.id}
                      href={`/discogs/artists/${artist.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {artist.name}
                      {release.artists && index < release.artists.length - 1
                        ? ", "
                        : ""}
                    </Link>
                  ))}
              </div>

              <div className="mb-4">
                {release.labels &&
                  release.labels.map((label, index) => (
                    <div key={label.id}>
                      <Link
                        href={`/discogs/labels/${label.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {label.name}
                      </Link>
                      {label.catno && (
                        <span className="text-muted-foreground ml-2">
                          (Cat# {label.catno})
                        </span>
                      )}
                    </div>
                  ))}
              </div>

              <div className="mb-4 flex gap-2">
                {release.year && <Badge>{release.year}</Badge>}
                {release.country && (
                  <Badge variant="outline">{release.country}</Badge>
                )}
              </div>

              {release.formats && (
                <div className="mb-4">
                  {release.formats.map((format, index) => (
                    <Badge key={index} variant="secondary" className="mr-2">
                      {format.qty}× {format.name}
                      {format.descriptions &&
                        format.descriptions.length > 0 && (
                          <span className="ml-1">
                            ({format.descriptions.join(", ")})
                          </span>
                        )}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="mb-6">
                {release.genres && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {release.genres.map((genre) => (
                      <Badge key={genre} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}
                {release.styles && (
                  <div className="flex flex-wrap gap-2">
                    {release.styles.map((style) => (
                      <Badge key={style} variant="outline">
                        {style}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {release.notes && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Notes</h2>
                  <p className="whitespace-pre-line">{release.notes}</p>
                </div>
              )}

              {release.tracklist && release.tracklist.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Tracklist</h2>
                  <div className="grid gap-2">
                    {release.tracklist.map((track, index) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          <span className="text-muted-foreground mr-2">
                            {track.position}.
                          </span>
                          {track.title}
                          {track.artists && (
                            <span className="text-sm text-muted-foreground ml-2">
                              by {track.artists.map((a) => a.name).join(", ")}
                            </span>
                          )}
                        </div>
                        {track.duration && (
                          <span className="text-muted-foreground">
                            {track.duration}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {release.identifiers && release.identifiers.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Identifiers</h2>
                  <div className="grid gap-2">
                    {release.identifiers.map((id, index) => (
                      <div key={index}>
                        <span className="font-medium">{id.type}:</span>{" "}
                        <span className="text-muted-foreground">
                          {id.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {release.videos && release.videos.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Videos</h2>
                  <div className="grid gap-4">
                    {release.videos.map((video, index) => (
                      <a
                        key={index}
                        href={video.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {video.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <a
                  href={release.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on Discogs
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error fetching release:", error);
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>
          There was an error fetching the release information. Please try again
          later.
        </p>
        <Link href="/discogs" className="text-blue-600 hover:underline">
          Back to search
        </Link>
      </div>
    );
  }
};

export default ReleasePage;
