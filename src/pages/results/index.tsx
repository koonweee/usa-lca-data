import { LCATable } from '@/components/lca-table'
import { trpc } from '@/lib/trpc';
import { Layout, Spin, Typography } from 'antd';
import { ConfigProvider, theme } from "antd";
import Link from 'next/link';

const { Content, Footer } = Layout;
const { Title } = Typography;

const { darkAlgorithm, defaultAlgorithm } = theme;

export default function Page() {
  const { data: lcaData, isLoading } = trpc.useQuery(['lca.findAll']);

  return (
    <ConfigProvider theme={{algorithm: darkAlgorithm}}>
        <Layout style={{height:"100vh", width: '100%', background: "black"}}>
          <Content>
            <Title style={{textAlign: "left", margin: "24px 32px"}}>H1B1 Visa</Title>
            <div style={{ padding: 24, minHeight: 360, background: "black"}}>
                {isLoading && <div style={{height:"100vh", width: '100%', background: "black"}}><Spin size='large' /></div>}
                {!isLoading && lcaData && <LCATable lcaData={lcaData} />}
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
