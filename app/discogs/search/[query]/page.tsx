import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Client } from "disconnect";
import { NextPage } from "next";
import Link from "next/link";

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
      // sort: "release_date",
      // sort_order: "asc",
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
      <form
        className="mb-6"
        action={`/discogs/search/${encodeURIComponent(query)}`}
        method="get"
      >
        <label htmlFor="search" className="sr-only">
          Search Discogs
        </label>
        <Input type="text" placeholder="Search..." defaultValue={query} />
        <button type="submit">Search</button>
      </form>

      <h1 className="text-2xl font-bold mb-6">
        Search Results for "{decodeURIComponent(query)}" ({pagination.items}{" "}
        items)
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
        {searchResults.map((item) => (
          <Link
            key={`${item.type}-${item.id}`}
            href={`/discogs/artists/${item.id}/${item.id}`}
            className="block bg-card text-card-foreground rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {" "}
            <div className="aspect-square bg-muted relative">
              {item.thumb || item.cover_image ? (
                <img
                  src={item.thumb || item.cover_image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-xs mb-1 line-clamp-2">{item.title}</h2>
              <div className="text-sm text-muted-foreground">
                {item.year && <Badge>{item.year}</Badge>}
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
              className="px-4 py-2 border rounded hover:bg-accent text-accent-foreground"
            >
              Previous
            </Link>
          )}
          {page < pagination.pages && (
            <Link
              href={`/discogs/search/${encodeURIComponent(query)}?page=${page + 1}${type ? `&type=${type}` : ""}`}
              className="px-4 py-2 border rounded hover:bg-accent text-accent-foreground"
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
