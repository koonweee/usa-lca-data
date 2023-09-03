'use client'

import { Suspense, useEffect, useState } from 'react'
import TablePlaceholder from '@/components/table-placeholder'
import { LCATable } from '@/components/lca-table'
import { Spin } from 'antd';
import { LCAData } from '@/pages/api/get_lca_data';
import { ConfigProvider, theme } from "antd";

// Prisma does not support Edge without the Data Proxy currently
// export const runtime = 'edge'
export const preferredRegion = 'home'
export const dynamic = 'force-dynamic'


export default function Home() {
  //call prisma in a useEffect hook and store its state to a useState hook
  const [lcaData, setLcaData] = useState<LCAData[]>([]);
  //show loading state while waiting for data to load
  const [loading, setLoading] = useState(true);
  const { darkAlgorithm, defaultAlgorithm } = theme;

  useEffect(() => {
    fetch('/api/fetch-lca-data',{
      method: 'POST',
    })
      .then((res) => res.json())
      .then((data) => {
        const LCAData = data.LCAData;
        setLcaData(LCAData);
        setLoading(false);
      })
  }, [])

  return (
    <ConfigProvider theme={{algorithm: defaultAlgorithm}}>
      <main className="relative flex min-h-screen flex-col items-center justify-center">
        <h1 className="pt-4 pb-8 bg-gradient-to-br from-black via-[#171717] to-[#575757] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
          H1B1 Visa Data
        </h1>
        <Suspense fallback={<TablePlaceholder />}>
          {loading && <Spin size='large' />}
          {!loading && <LCATable lcaData={lcaData} />}
        </Suspense>
      </main>
    </ConfigProvider>
  )
}
