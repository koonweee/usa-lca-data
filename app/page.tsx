import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import Table from '@/components/table'
import TablePlaceholder from '@/components/table-placeholder'
import ExpandingArrow from '@/components/expanding-arrow'
import JobCategoryBreakdown from "@/components/job-category-breakdown";
import {lca_disclosures} from ".prisma/client";

// Prisma does not support Edge without the Data Proxy currently
// export const runtime = 'edge'
export const preferredRegion = 'home'
export const dynamic = 'force-dynamic'


// mock some lca_disclosures data
const lcaDisclosuresData: lca_disclosures[] = [
    {
        id: '1',
        socTitle: "Software Engineer",
    },
    {
        id: '2',
        socTitle: "Software Engineer",
    },
    {
        id: '3',
        socTitle: "Juchi Photographer",
    }
]


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

      <Suspense fallback={null}>
          <JobCategoryBreakdown lca_disclosures={lcaDisclosuresData}/>
      </Suspense>
    </main>
  )
}
