-- ========= RELEASES =======================================================
-- Create the releases table
-- Represents a specific physical or digital release.
-- This table is used to store detailed information about each release, including its title, artist(s), format(s), and other metadata.
CREATE TABLE public.releases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), -- UUID as primary key
    created_at timestamp DEFAULT now(), -- Timestamp of creation
    updated_at timestamp DEFAULT now(), -- Timestamp of last update

    master_id bigint, -- Discogs master release ID
    releases_ids bigint[], -- Array of Discogs release IDs

    artists_id bigint[], -- Array of Discogs artist IDs
    artists_name text[], -- Array of artist names (e.g., "The Beatles", "John Lennon"); in sync with artists_id

    title text NOT NULL,
    status text, -- Release status (e.g., "Accepted")
    data_quality text NOT NULL,
    country text,
    year_of_release int, -- Numeric year of release
    notes text, -- General notes about the release

    -- Detailed information stored as JSONB or arrays
    companies_json jsonb, -- JSONB storing array of company objects (manufacturing, publishing, etc.)
    extraartists_json jsonb, -- JSONB storing array of "extra" artist credits (e.g., Engineer, Producer)
    formats_json jsonb, -- JSONB storing array of format objects (name, qty, descriptions, text)
    genres text[],
    styles text[],
    identifiers_json jsonb, -- JSONB storing array of identifiers (barcode, catno variations, matrix)
    images_json jsonb, -- JSONB storing array of image objects for this release
    series_json jsonb, -- JSONB storing array of series this release belongs to
    videos_json jsonb, -- JSONB storing array of video objects related to this release
    tracklist_json jsonb -- JSONB storing array of track objects (position, title, duration, extraartists, etc.)
) WITH (OIDS=FALSE);
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;

-- Indexes for releases table
CREATE INDEX idx_releases_year_of_release ON public.releases(year_of_release);
CREATE INDEX idx_releases_country ON public.releases(country);
CREATE INDEX idx_releases_title ON public.releases(title); -- Index on title for searching
CREATE INDEX idx_master_id ON public.releases (master_id);
-- Indexes GIN: for array columns
CREATE INDEX idx_gin_releases_artists_name ON public.releases USING GIN (artists_name);
CREATE INDEX idx_gin_releases_artists_id ON public.releases USING GIN (artists_id);

