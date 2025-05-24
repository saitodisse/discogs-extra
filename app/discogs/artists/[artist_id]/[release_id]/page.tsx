import { Client } from "disconnect";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReleasePage({
  params,
}: {
  params: { artist_id: string; release_id: string };
}) {
  const { artist_id, release_id } = params;

  if (
    !process.env.DISCOGS_CONSUMER_KEY ||
    !process.env.DISCOGS_CONSUMER_SECRET
  ) {
    console.error("Missing required Discogs API credentials");
    return (
      <div className="container mx-auto p-4 min-w-2xl">
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

    // Get release details
    const release = await client.database().getRelease(release_id);

    console.log("release", release);

    // Get release artist
    const artist = release.artists?.[0];

    // Get artist details for the back link
    // const artist = await client.database().getArtist(artist_id);

    // Format tracklist
    const formatTracklist = (tracks: any[]) => {
      return tracks.map((track, index) => ({
        position: track.position || `${index + 1}`,
        title: track.title,
        duration: track.duration || "",
        type: track.type_,
      }));
    };

    // Format credits
    const formatCredits = (artists: any[]) => {
      return artists.map((artist) => ({
        name: artist.name,
        role: artist.role,
        join: artist.join,
      }));
    };

    return (
      <div className="container mx-auto p-4 max-w-5xl w-lvw">
        <Link
          href={`/discogs/artists/${artist_id}`}
          className="inline-flex items-center text-primary hover:underline mb-6"
        >
          ← Back to {artist?.name}
        </Link>

        <div className="flex flex-col md:flex-row gap-8 mb-8 w-full">
          {/* Cover Art */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
              {release.images && release.images.length > 0 ? (
                <Image
                  src={release.images[0].uri || release.images[0].resource_url}
                  alt={release.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {release.formats && release.formats.length > 0 && (
                <div>
                  <h3 className="font-semibold">Format</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {release.formats.map((format: any, i: number) => (
                      <Badge key={i} variant="outline">
                        {format.name} {format.qty > 1 ? `×${format.qty}` : ""}
                        {format.text && ` (${format.text})`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {release.labels && release.labels.length > 0 && (
                <div>
                  <h3 className="font-semibold">Label</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {release.labels.map((label: any, i: number) => (
                      <Badge key={i} variant="outline">
                        {label.name} {label.catno ? `(${label.catno})` : ""}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {release.released && (
                <div>
                  <h3 className="font-semibold">Released</h3>
                  <p>{release.released}</p>
                </div>
              )}

              {release.country && (
                <div>
                  <h3 className="font-semibold">Country</h3>
                  <p>{release.country}</p>
                </div>
              )}

              {release.genres && release.genres.length > 0 && (
                <div>
                  <h3 className="font-semibold">Genre</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {release.genres.map((genre: string, i: number) => (
                      <Badge key={i} variant="outline">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {release.styles && release.styles.length > 0 && (
                <div>
                  <h3 className="font-semibold">Style</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {release.styles.map((style: string, i: number) => (
                      <Badge key={i} variant="outline">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Release Details */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{release.title}</h1>
            <h2 className="text-xl text-muted-foreground mb-6">
              {release.artists && release.artists.map((a) => a.name).join(", ")}
            </h2>

            <Tabs defaultValue="tracks" className="w-full">
              <TabsList>
                <TabsTrigger value="tracks">Tracklist</TabsTrigger>
                <TabsTrigger value="credits">Credits</TabsTrigger>
                <TabsTrigger value="info">Additional Information</TabsTrigger>
              </TabsList>

              <TabsContent value="tracks" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tracklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {release.tracklist && release.tracklist.length > 0 ? (
                      <div className="space-y-2">
                        {release.tracklist.map((track: any, index: number) => (
                          <div
                            key={index}
                            className="py-2 border-b last:border-0"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-muted-foreground text-sm mr-2">
                                  {track.position || `${index + 1}.`}
                                </span>
                                <span className="font-medium">
                                  {track.title}
                                </span>
                              </div>
                              {track.duration && (
                                <span className="text-sm text-muted-foreground">
                                  {track.duration}
                                </span>
                              )}
                            </div>
                            {track.extraartists &&
                              track.extraartists.length > 0 && (
                                <div className="text-sm text-muted-foreground ml-6">
                                  {track.extraartists
                                    .map((a: any) => a.name)
                                    .join(", ")}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No tracklist available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="credits" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Credits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {release.extraartists && release.extraartists.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {release.extraartists.map(
                          (artist: any, index: number) => (
                            <div key={index} className="border rounded p-3">
                              <div className="font-medium">{artist.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {artist.role}
                              </div>
                              {artist.tracks && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Tracks: {artist.tracks}
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p>No credits available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="info" className="mt-6">
                <div className="space-y-6">
                  {release.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-line">
                          {release.notes}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {release.videos && release.videos.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Videos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {release.videos.map((video: any, index: number) => (
                            <div
                              key={index}
                              className="aspect-video bg-muted rounded overflow-hidden"
                            >
                              <iframe
                                src={`https://www.youtube.com/embed/${video.uri.split("v=")[1]}`}
                                className="w-full h-full"
                                allowFullScreen
                              />
                              <p className="mt-2 text-sm">{video.title}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {release.identifiers && release.identifiers.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Identifiers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {release.identifiers.map((id: any, index: number) => (
                            <div key={index}>
                              <span className="font-medium">{id.type}:</span>{" "}
                              {id.value}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching release:", error);
    notFound();
  }
}
