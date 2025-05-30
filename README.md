# Discogs Extra

A modern web application that connects to the Discogs API to fetch and display
music information with user authentication and a clean interface.

## Tech Stack

- **Framework:** Next.js with App Router
- **Backend:** Supabase (Auth + PostgreSQL)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Deployment:** Vercel

## Features

### 🔐 Authentication

Complete auth system with sign up, sign in, password reset, and SSR support.

### 🎵 Discogs Integration

- Search the Discogs database
- View detailed artist, label, and release information
- Browse master releases with grid/list views
- Display cover art and images

### 🎨 Modern UI

- Responsive design with Tailwind CSS
- Light/dark theme support
- Accessible components with shadcn/ui

## Quick Start

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd discogs-extra
   npm install
   ```

2. **Set up environment variables** Copy `.env.example` to `.env.local` and
   configure your Supabase credentials.

3. **Run development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
├── app/                      # Next.js App Router directory
│   ├── (auth-pages)         # Authentication related pages
│   ├── api/                 # API routes
│   │   ├── db/             # Database-related API endpoints
│   │   ├── discogs/        # Discogs API integration endpoints 
│   │   └── discogsSite/    # Direct Discogs site scraping endpoints
│   ├── discogs/            # Discogs feature pages
│   └── masters/            # Master releases pages
├── components/             # Reusable UI components
│   ├── ui/                # shadcn/ui components
│   ├── tutorial/          # Tutorial-related components
│   └── typography/        # Typography-related components
├── lib/                   # Core utilities and business logic
├── sql/                   # Database schema and migrations
├── types/                 # TypeScript type definitions
│   ├── discogs_site/     # Discogs site API types
│   ├── disconnect/       # Disconnect library types
│   └── ReleaseDb.ts     # Database types
└── utils/                # Utility functions
    └── supabase/        # Supabase client utilities
```

### Key Features

- **Authentication**: Supabase-powered auth system with sign-in, sign-up, and password reset
- **Discogs Integration**: Search and browse Discogs database with release details
- **Master Releases**: View and manage master releases with their variants
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Deployment

Deploy easily to Vercel with automatic Supabase integration for environment
variables.
