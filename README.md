# Discogs Extra

- Connects to the Discogs API to fetch and display music information
- Merge release inf


## Core Technologies

* **Framework:** Next.js (using App Router, Pages Router, Middleware, Client and Server Components)
* **Backend and Database:** Supabase (including Supabase Auth and PostgreSQL database)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **UI Components:** shadcn/ui
* **Deployment:** Vercel (with easy Supabase integration)

---

## Key NPM Libraries

The project uses various NPM libraries:

* **UI and Components:**
    * `@radix-ui/*`: Primitive UI components for accessibility and customization.
    * `lucide-react`: SVG icons.
    * `react`, `react-dom`: Fundamental library for building user interfaces.
    * `tailwindcss-animate`: For animations with Tailwind CSS.
    * `class-variance-authority`, `clsx`, `tailwind-merge`: Utilities for CSS class manipulation, especially with Tailwind.
* **Supabase Integration:**
    * `@supabase/ssr`: For Server-Side Rendering with Supabase authentication.
    * `@supabase/supabase-js`: Official JavaScript client for Supabase.
* **Discogs Integration:**
    * `disconnect`: Client library for the Discogs API v2.0.
* **Next.js and Ecosystem:**
    * `next`: The React framework for production.
    * `next-themes`: For theme management (light/dark).
    * `nuqs`: For typed URL query state management, used in the Discogs releases feature.
* **Utilities and Formatting:**
    * `autoprefixer`: Adds CSS vendor prefixes.
    * `prettier`, `prettier-plugin-tailwindcss`: For automatic code formatting, integrated with Tailwind CSS.
    * `typescript`: Superset of JavaScript that adds static typing.

---

## Features

The project includes authentication, Discogs API integration, and a modern UI.

### Authentication

Robust authentication system using Supabase Auth:
* User Sign Up
* User Sign In
* Sign Out
* Forgot Password
* Reset Password
* Server-Side Rendering (SSR) authentication using cookies.
* Middleware for user session updates.

### Discogs API Integration

Connects to the Discogs API to fetch and display music information:
* Uses the `disconnect` library for API communication.
* Displays detailed data for artists, master releases, and specific releases.
* Allows searching the Discogs database.
* `ReleasesClient` component displays versions/releases of a Discogs "master," with view toggling (grid/list) and URL-based pagination (via `nuqs`).
* Displays cover art and artist images directly from `i.discogs.com`.

### User Interface and Styling

* Modern interface built with **shadcn/ui** components.
* Flexible and responsive styling using **Tailwind CSS**.
* Light and dark theme support with a theme switcher.

### Routing (Next.js App Router)

The project uses Next.js App Router:
* **Home Page (`/`):** Introduction and setup/usage steps.
* **Auth Pages (`app/(auth-pages)/`):**
    * `/sign-in`
    * `/sign-up`
    * `/forgot-password`
* **Auth Callback (`app/auth/callback/route.ts`):** Handles OAuth provider (Supabase) returns.
* **Discogs Section (`app/discogs/`):**
    * `/discogs/artists/[artist_id]`
    * `/discogs/labels/[label_id]`
    * `/discogs/masters/[master_id]`
    * `/discogs/masters/[master_id]/releases`
    * `/discogs/releases/[release_id]`
    * `/discogs/search/[query]`
* **Protected Area (`app/protected/`):** Content for authenticated users only.
    * `/app/protected/reset-password/`: Allows authenticated users to reset their password.

### Development and Deployment

* Detailed local development setup instructions.
* Easy Vercel deployment with automatic environment variable setup via Supabase Vercel Integration.
* Code formatting enforced by Prettier.

### Component Structure

Organized with reusable components:
* **UI Primitives (`components/ui/`):** Includes Badge, Button, Card, Checkbox, DropdownMenu, Input, Label, RadioGroup, Separator, Table, Tabs, and Toggle, following shadcn/ui patterns.
* **Tutorial Components (`components/tutorial/`):** Assist with initial setup and demonstrate features.
* **Specific Components:** Such as `DeployButton`, `EnvVarWarning`, `HeaderAuth`, `Hero`, `SearchInput`, `SubmitButton`, and `ThemeSwitcher`.