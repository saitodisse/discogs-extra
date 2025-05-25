import Link from "next/link";

export default async function DiscogsPage() {
    return <div>
        <h1>Discogs Page</h1>
        <Link href="/discogs/search">Search</Link>
    </div>
}
