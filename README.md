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
app/
├── (auth-pages)/          # Authentication pages
├── discogs/              # Discogs API routes
├── protected/            # Protected user content
└── auth/callback/        # OAuth callback

components/
├── ui/                   # shadcn/ui components
└── tutorial/             # Setup guides
```

## Deployment

Deploy easily to Vercel with automatic Supabase integration for environment
variables.
