'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense, use, useEffect, useMemo, useState } from 'react'
import Table from '@/components/table'
import TablePlaceholder from '@/components/table-placeholder'
import ExpandingArrow from '@/components/expanding-arrow'
import JobCategoryBreakdown from "@/components/job-category-breakdown";
import {lca_disclosures} from ".prisma/client";
import { LCATable } from '@/components/lca-table'
import {lcaDataFormatter } from '@/pages/api/get_lca_data'
import prisma from '@/lib/prisma'
import { LCAData } from '@/hooks/get_lca_data'

// Prisma does not support Edge without the Data Proxy currently
// export const runtime = 'edge'
export const preferredRegion = 'home'
export const dynamic = 'force-dynamic'


export default function Home() {
  //call prisma in a useEffect hook and store its state to a useState hook
  const [lcaData, setLcaData] = useState<LCAData[]>([]);
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/fetch-lca-data',{
      method: 'POST',
    })
      .then((res) => res.json())
      .then((data) => {
        const LCAData = data.lcaData;
        console.log(LCAData)

        // setLcaData(LCAData);
        // setLoading(false)
      })
    console.log("running")
  }, [])
  
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <h1 className="pt-4 pb-8 bg-gradient-to-br from-black via-[#171717] to-[#575757] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
        H1B1 Visa Data
      </h1>
      <Suspense fallback={<TablePlaceholder />}>
        <LCATable lcaData={lcaData} />
      </Suspense>
    </main>
  )
}
