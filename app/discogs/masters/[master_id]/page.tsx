import { Client } from "disconnect";
import { NextPage } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface MasterPageProps {
  params: {
    master_id: string;
  };
}

interface Master {
  id: number;
  title: string;
  artists: Array<{
    name: string;
    id: number;
  }>;
  genres?: string[];
  styles?: string[];
  year?: number;
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
  data_quality?: string;
  tracklist: Array<{
    position: string;
    title: string;
    duration: string;
  }>;
  uri: string;
  description?: string;
  notes?: string;
}

const MasterPage: NextPage<MasterPageProps> = async ({ params }) => {
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
    const master = await client
      .database()
      .getMaster(parseInt(params.master_id));

    return (
      <div className="container mx-auto p-4">
        <Card className="w-full">
          <div className="grid md:grid-cols-[300px_1fr] gap-6 p-6">
            {/* Album Cover */}
            <div className="aspect-square bg-muted relative rounded-lg overflow-hidden">
              {master.images && master.images[0] ? (
                <img
                  src={master.images[0].uri}
                  alt={master.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>

            {/* Album Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{master.title}</h1>

              <div className="mb-4">
                {master.artists &&
                  master.artists.map((artist, index) => (
                    <Link
                      key={artist.id}
                      href={`/discogs/artists/${artist.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {artist.name}
                      {index < master.artists.length - 1 ? ", " : ""}
                    </Link>
                  ))}
              </div>

              {master.year && (
                <div className="mb-4">
                  <Badge>{master.year}</Badge>
                </div>
              )}

              <div className="mb-6">
                {master.genres && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {master.genres.map((genre) => (
                      <Badge key={genre} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}
                {master.styles && (
                  <div className="flex flex-wrap gap-2">
                    {master.styles.map((style) => (
                      <Badge key={style} variant="outline">
                        {style}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* {master.notes && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Notes</h2>
                  <p className="whitespace-pre-line">{master.notes}</p>
                </div>
              )} */}

              {master.tracklist && master.tracklist.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Tracklist</h2>
                  <div className="grid gap-2">
                    {master.tracklist.map((track, index) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          <span className="text-muted-foreground mr-2">
                            {track.position}.
                          </span>
                          {track.title}
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

              {master.videos && master.videos.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Videos</h2>
                  <div className="grid gap-4">
                    {master.videos.map((video, index) => (
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
                  href={master.uri}
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
    console.error("Error fetching master:", error);
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>
          There was an error fetching the master information. Please try again
          later.
        </p>
        <Link href="/discogs" className="text-blue-600 hover:underline">
          Back to search
        </Link>
      </div>
    );
  }
};

export default MasterPage;
