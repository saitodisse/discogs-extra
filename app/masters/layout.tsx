import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { type ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <div className="w-max-5xl container w-full p-4">{children}</div>
    </NuqsAdapter>
  )
}

export const metadata = {
  title: 'Discogs Extra! Masters',
  description: 'Explore and manage Discogs masters with ease.',
}
