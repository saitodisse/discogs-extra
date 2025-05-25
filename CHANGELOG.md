# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

-

### Removed

-

### Fixed

-

### Security

-

## [0.1.0] - 2025-05-24

### Added

- Initial project setup.
- CHANGELOG.md file to track project changes.
- Set up Next.js route structure for Discogs integration:
  - Created dynamic routes and page components for artists, masters, releases, and search.
- Added `disconnect` package (v1.2.2) for Discogs API integration.
- Implemented `ReleasesClient` component (`app/discogs/masters/[master_id]/releases/ReleasesClient.tsx`) to display versions/releases for a Discogs master:
  - Toggles between Grid and List views for releases.
  - View state (grid/list, page) managed in URL query parameters using `nuqs`.
  - Displays release details: thumbnail, title (link to release), year, country, labels, catalog number, and formats.
  - Includes navigation links (to individual release pages, back to master page).
  - Handles loading and error states gracefully.
- Integrated ShadCN UI components (`Toggle`, `Table`, `Badge`, `Card`) and `lucide-react` icons for the user interface.
- Refactored `ReleasesClient` by extracting helper components (`NoImagePlaceholder`, `DisplayLabels`, `DisplayFormats`, `ReleaseGridItem`, `ReleaseListItem`) for improved code structure and reusability.
- Enhanced TypeScript typings for Discogs API data structures used in the client.
