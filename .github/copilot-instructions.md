- Always check README.md to see the project description
- Always check CHANGELOG.md to see the project history and changes
- Always check schema.sql to see the database schema
- windows environment, use powershell
- Use `pnpm add` to add dependencies
- When adding shadcn components, use `pnpm dlx shadcn@latest add <component-name>`
- Always check for new documentation when using external libraries: use context7;
- do not run `pnpm dev`, its is already running on localhost:3000
- Always try to use nuqs for control page state
- automatically clean up the file and remove the duplicate code

### use new way to declare pages on Next 15. The params and searchParams are promises:

```typescript
export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ query: string }>
  searchParams: Promise<{
    page?: string
    type?: 'release' | 'master' | 'artist' | 'label'
  }>
})
```

- Next.js all pages are server components by default. Must create new components with `use client` directive if you want to use client-side features like state management, effects, etc.
- Use `use nuqs` to manage state in client components.
