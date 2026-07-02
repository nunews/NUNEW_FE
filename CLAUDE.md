# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NUNEWS (누뉴) is a Korean news aggregation platform that provides easy-to-read news articles with social features. Built with Next.js 15, React 19, and Supabase.

## Development Commands

### Core Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Testing

This project does not currently have automated tests configured.

## Architecture Overview

### Framework Stack

- **Next.js 15** with App Router (React Server Components enabled)
- **React 19** with TypeScript 5
- **Supabase** for database, authentication, and storage
- **React Query (TanStack Query v5)** for server state management
- **Zustand** for client state management
- **Tailwind CSS v4** with Shadcn UI components

### Key Architectural Patterns

#### 1. Data Flow Pattern

```
External APIs (NewsData.io, OpenAI)
  ↓
lib/api/* functions (fetchNews.ts, summarySupabase.ts)
  ↓
Server Actions (lib/actions/*)
  ↓
Custom Hooks (hooks/useNewsData.ts, etc.)
  ↓
Components (render with React Query caching)
```

#### 2. Authentication Flow

Authentication is handled by Supabase Auth with automatic session initialization:

- `AuthBootstrap` component (src/components/auth/AuthBootstrap.tsx) runs on app load
- Fetches user session, profile, and interests from Supabase
- Stores user data in `authStore` (Zustand)
- Protected routes check `authStore.userId` for authentication state

#### 3. Supabase Client Patterns

**Two client creation patterns exist:**

- `src/lib/supabase.ts`: Legacy client using `createClient()` - avoid using this
- `src/utils/supabase/client.ts`: Preferred SSR-compatible client using `createBrowserClient()`

**Always use:** `import createClient from "@/utils/supabase/client"`

#### 4. Server vs Client Components

- **Server Components (default)**: Pages, layouts, initial data fetching
- **Client Components ("use client")**: Interactive features (forms, likes, comments), React Query hooks, Zustand stores

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (auth.ts, community.ts, theme/route.ts)
│   ├── auth/              # Authentication pages (login, callback)
│   ├── community/         # Community posts feature
│   ├── newsDetail/[id]/   # Dynamic news article pages
│   ├── mypage/            # User profile and saved content
│   └── profile/           # Profile settings and initialization
├── components/            # Reusable components organized by feature
│   ├── ui/               # Shadcn UI primitives
│   └── [feature]/        # Feature-specific components
├── hooks/                # Custom React hooks (all use React Query)
├── lib/
│   ├── api/              # External API integrations
│   ├── actions/          # Next.js server actions
│   └── queries/          # React Query query configurations
├── stores/               # Zustand stores (authStore, communitySortStore)
├── types/                # TypeScript type definitions (.d.ts files)
└── utils/                # Utility functions
    └── supabase/         # Supabase client utilities
```

### Database Schema (Supabase)

**Key Tables:**

- `News`: Article data with aggregated stats (view_count, like_count)
- `User`: User profiles (nickname, email, interests, profile_image, age_range, gender)
- `Post`: Community discussion posts
- `Comments`: Comments on posts
- `Like`: Like records for posts, news articles, and comments
- `User_Interests`: Many-to-many relationship between users and category preferences

**Important Columns:**

- All tables use snake_case naming (e.g., `user_id`, `news_id`, `created_at`)
- Primary keys typically follow pattern: `{table_name}_id`
- Foreign keys reference using `{related_table}_id`

### State Management

#### Zustand Stores

- `authStore` (src/stores/authStore.ts): User authentication state, profile data, interests array

  - Use `setUser()` to update user data
  - Use `clearUser()` to sign out and reset state
  - Check `isInitialized` before reading user data

- `communitySortStore`: UI state for community post sorting preferences

#### React Query Usage

All data fetching hooks use React Query with these conventions:

- Query keys are arrays: `["news", filters]` or `["post", postId]`
- Mutations invalidate relevant queries after success
- Loading states use `isPending`, not `isLoading`
- Example: `hooks/useNewsData.ts`, `hooks/usePostComments.ts`

### Important Patterns

#### Path Aliases

Use `@/` prefix for all imports:

```typescript
import createClient from "@/utils/supabase/client";
import { useAuthStore } from "@/stores/authStore";
```

#### News Data Flow

1. External news fetched from NewsData.io API (lib/api/fetchNews.ts)
2. Saved to Supabase News table (lib/api/getNewstoSupabase.ts)
3. AI summaries generated via OpenAI GPT-4o (lib/api/summarySupabase.ts)
4. Frontend fetches from Supabase with React Query hooks

#### Image Handling

- Images are unoptimized (next.config.ts: `unoptimized: true`)
- Supabase storage domain whitelisted: `fphzfpdzjejbowwvniqx.supabase.co`
- All external domains allowed via `remotePatterns`

#### Component Organization

- Feature components live in `components/[feature]/`
- Each feature has a `Skeleton/` subfolder for loading states
- UI primitives from Shadcn UI in `components/ui/`

### Environment Variables

Required in `.env`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEWSDATA_API_KEY=
OPENAI_API_KEY=
```

### Styling

- **Tailwind CSS v4** with PostCSS
- **Font**: Pretendard (Korean-optimized, loaded as local font)
- **Theme**: Dark/light mode via `next-themes` with system detection enabled
- **Component library**: Shadcn UI (New York style, Lucide icons)
- **Max width**: Container max-width is `max-w-screen-lg` (1024px)

### Code Conventions

1. **TypeScript**: Strict mode enabled
2. **File naming**:
   - Components: PascalCase (e.g., `AuthBootstrap.tsx`)
   - Utilities/hooks: camelCase (e.g., `useNewsData.ts`)
   - Types: camelCase with .d.ts extension (e.g., `news.d.ts`)
3. **Component structure**: Client components must have `"use client"` directive
4. **Database queries**: Use parameterized queries with Supabase client methods (`.select()`, `.insert()`, etc.)

### PR Guidelines

When creating PRs, follow the template at `.github/PULL_REQUEST_TEMPLATE.md`:

- Include overview, summary, and PR type
- Add screenshots for UI changes
- Note areas for reviewer focus

### Common Gotchas

1. **Supabase clients**: Always use `createClient()` from `@/utils/supabase/client`, not `@/lib/supabase`
2. **Auth state**: Check `authStore.isInitialized` before accessing user data to avoid race conditions
3. **React Query**: Use `isPending` for loading states (React Query v5), not `isLoading`
4. **News data types**: External API uses `NewsData` interface, Supabase uses `SupabaseNewsData` interface
5. **Server Actions**: Located in `lib/actions/`, not `app/actions/`
