'use client'

import { Suspense, useEffect, useState } from 'react'
import TablePlaceholder from '@/components/table-placeholder'
import { LCATable } from '@/components/lca-table'
import { Layout, Menu, Spin, Typography } from 'antd';
import { LCAData } from '@/pages/api/get_lca_data';
import { ConfigProvider, theme } from "antd";
import Link from 'next/link';

// Prisma does not support Edge without the Data Proxy currently
// export const runtime = 'edge'
export const preferredRegion = 'home'
export const dynamic = 'force-dynamic'

const { Content, Header, Footer } = Layout;
const { Title } = Typography;

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

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <ConfigProvider theme={{algorithm: darkAlgorithm}}>
        <Layout style={{height:"100vh"}}>
          <Content style={{ margin: '32px 24px 0' }}>
            <Title style={{textAlign: "left", margin: "24px 32px"}}>H1B1 Visa</Title>
            <div style={{ padding: 24, minHeight: 360, background: "black"}}>
                {loading && <Spin size='large' />}
                {!loading && <LCATable lcaData={lcaData} />}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Built by{' '}
            <Link
              href="https://github.com/koonweee"
              className="font-medium underline underline-offset-4 hover:text-black transition-colors"
            >
              Jeremy Tan
            </Link>
            ,{' '}
            <Link
              href="https://github.com/chuyouchia"
              className="font-medium underline underline-offset-4 hover:text-black transition-colors"
            >
              Jacob Chia
            </Link>{' '}
            and{' '}
            <Link
              href="https://github.com/iamgenechua"
              className="font-medium underline underline-offset-4 hover:text-black transition-colors"
            >
              Gene Chua
            </Link>
          </Footer>
        </Layout>
    </ConfigProvider>
  )
}
