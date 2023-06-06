import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import Table from '@/components/table'
import TablePlaceholder from '@/components/table-placeholder'
import ExpandingArrow from '@/components/expanding-arrow'

// Prisma does not support Edge without the Data Proxy currently
// export const runtime = 'edge'
export const preferredRegion = 'home'
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <h1 className="pt-4 pb-8 bg-gradient-to-br from-black via-[#171717] to-[#575757] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
        H1B1 Visa Data
      </h1>
      <Suspense fallback={<TablePlaceholder />}>
        {/* @ts-expect-error Async Server Component */}
        <Table />
      </Suspense>
      <p className="font-light text-gray-600 w-full max-w-lg text-center mt-6">
        Built with{' '}
        <Link
          href="https://vercel.com/postgres"
          className="font-medium underline underline-offset-4 hover:text-black transition-colors"
        >
          Vercel Postgres
        </Link>
        ,{' '}
        <Link
          href="https://prisma.io"
          className="font-medium underline underline-offset-4 hover:text-black transition-colors"
        >
          Prisma
        </Link>{' '}
        and{' '}
        <Link
          href="https://nextjs.org/docs"
          className="font-medium underline underline-offset-4 hover:text-black transition-colors"
        >
          Next.js
        </Link>
        .
      </p>

    </main>
  )
}
