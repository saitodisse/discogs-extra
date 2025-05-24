import { Client } from "disconnect";
import type { DatabaseSearchResponse } from "disconnect";
import { NextPage } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface SearchParams {
  params: {
    query: string;
  };
  searchParams: {
    page?: string;
    type?: "release" | "master" | "artist" | "label";
  };
}

interface SearchResult {
  id: number;
  title: string;
  type: "release" | "master" | "artist" | "label";
  thumb?: string;
  cover_image?: string;
  year?: number;
  format?: string[];
  label?: string[];
  genre?: string[];
  style?: string[];
}

const SearchPage: NextPage<SearchParams> = async ({ params, searchParams }) => {
  const { query } = params;
  const page = parseInt(searchParams.page || "1");
  const type = searchParams.type || "release";
  const perPage = 24;

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

  let searchResults: SearchResult[] = [];
  let pagination = { pages: 1, items: 0 };

  try {
    const client = new Client({
      method: "discogs",
      consumerKey: process.env.DISCOGS_CONSUMER_KEY!,
      consumerSecret: process.env.DISCOGS_CONSUMER_SECRET!,
    });

    const searchResponse = await client.database().search(query, {
      type,
      page,
      per_page: perPage,
    });

    console.log(searchResponse);

    searchResults = searchResponse.results as SearchResult[];
    pagination = {
      pages: searchResponse.pagination?.pages || 1,
      items: searchResponse.pagination?.items || 0,
    };
  } catch (error) {
    console.error("Error searching Discogs:", error);
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Search Error</h1>
        <p>
          There was an error performing your search. Please try again later.
        </p>
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          No results found for "{decodeURIComponent(query)}"
        </h1>
        <Link href="/" className="text-blue-600 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Search Results for "{decodeURIComponent(query)}" ({pagination.items}{" "}
        items)
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {searchResults.map((item) => (
          <Link
            key={`${item.type}-${item.id}`}
            href={`/discogs/artists/${item.id}/${item.id}`}
            className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square bg-gray-100 relative">
              {item.thumb || item.cover_image ? (
                <img
                  src={item.thumb || item.cover_image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="font-semibold text-lg mb-1 line-clamp-2">
                {item.title}
              </h2>
              <div className="text-sm text-gray-600">
                {item.year && <div>Year: {item.year}</div>}
                {item.format && <div>Format: {item.format.join(", ")}</div>}
                {item.label && <div>Label: {item.label.join(", ")}</div>}
                {item.genre && item.genre.length > 0 && (
                  <div>Genre: {item.genre.join(", ")}</div>
                )}
                {item.style && item.style.length > 0 && (
                  <div>Style: {item.style.join(", ")}</div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/discogs/search/${encodeURIComponent(query)}?page=${page - 1}${type ? `&type=${type}` : ""}`}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Previous
            </Link>
          )}
          {page < pagination.pages && (
            <Link
              href={`/discogs/search/${encodeURIComponent(query)}?page=${page + 1}${type ? `&type=${type}` : ""}`}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
