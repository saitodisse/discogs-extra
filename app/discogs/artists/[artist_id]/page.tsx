import { Client } from "disconnect";
import type { Release } from "disconnect";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReleaseWithThumb extends Omit<Release, "thumb" | "format" | "label"> {
  thumb?: string;
  format?: string[];
  label?: string[];
  year?: number;
}

export default async function ArtistPage({
  params,
}: {
  params: { artist_id: string };
}) {
  const artistId = params.artist_id;

  if (
    !process.env.DISCOGS_CONSUMER_KEY ||
    !process.env.DISCOGS_CONSUMER_SECRET
  ) {
    console.error("Missing required Discogs API credentials");
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

  try {
    const client = new Client({
      method: "discogs",
      consumerKey: process.env.DISCOGS_CONSUMER_KEY!,
      consumerSecret: process.env.DISCOGS_CONSUMER_SECRET!,
    });

    // Get artist details
    const artist = await client.database().getArtist(artistId);

    // Get artist's releases
    const releasesResponse = await client
      .database()
      .getArtistReleases(artistId, {
        per_page: 50,
        sort: "year",
        sort_order: "desc",
      });

    const releases = (releasesResponse.results || []) as ReleaseWithThumb[];

    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {artist.images && artist.images.length > 0 && (
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={artist.images[0].uri || artist.images[0].resource_url}
                  alt={artist.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">{artist.name}</h1>
            {artist.profile && (
              <div className="prose max-w-none mb-6">
                <p className="whitespace-pre-line">{artist.profile}</p>
              </div>
            )}
            {artist.urls && artist.urls.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Links</h2>
                <div className="flex flex-wrap gap-2">
                  {artist.urls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {new URL(url).hostname}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Discography</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {releases.map((release) => (
            <Link
              key={release.id}
              href={`/discogs/artists/${artistId}/${release.id}`}
              className="block"
            >
              <Card className="h-full hover:bg-gray-50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">
                    {release.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-100 rounded-md overflow-hidden mb-3">
                    {release.thumb ? (
                      <Image
                        src={release.thumb}
                        alt={release.title}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {release.year && <div>Year: {release.year}</div>}
                    {release.format && (
                      <div>Format: {release.format.join(", ")}</div>
                    )}
                    {release.label && (
                      <div>Label: {release.label.slice(0, 2).join(", ")}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching artist:", error);
    notFound();
  }
}
