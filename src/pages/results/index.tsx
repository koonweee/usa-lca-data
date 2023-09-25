import { LCATable } from '@/components/lca-table'
import { LCATableMobile } from '@/components/lca-table-mobile';
import { trpc } from '@/lib/trpc';
import { Input, Layout, Spin, Typography } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const { Content, Footer } = Layout;
const { Title } = Typography;
const { Search } = Input;

export default function Page() {
  const router = useRouter();
  const { query } = router.query;
  const [searchQuery, setSearchQuery] = useState<string | undefined>('');
  const { data: lcaData, isLoading } = trpc.useQuery(['lca.findAll', { searchQuery: query as string | undefined }]);

  const [isMobile, setIsMobile] = useState<boolean>(true);

  useEffect(() => {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(
        navigator.userAgent
      )
    ) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }, [navigator.userAgent]);

  const onSearch = (value: string) => {
    router.push({
      pathname: router.asPath.split('?')[0],
      query: value? 
            { query: value }:
            undefined,
    });
  };


  useEffect(() => {
    setSearchQuery(query as string);
  }, [query]);

  return (
        <Layout style={{height:"100vh", width: '100vw', background: "black"}}>
          <Content style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
            <Title level={1} style={{textAlign: "left", margin: "12px 32px"}}>
              <div className="animation-text">
                Search H1B1 data, explore insights.
              </div>
            </Title>
            <div style={{padding: isMobile? '0% 2.5%' : '0%', maxWidth: isMobile? '92%': '100%', margin: '0% 2.5%'}}>
              <Search
                placeholder="Search by 'Software Engineer' or 'Google' here"
                allowClear
                enterButton="Search"
                size="large"
                onSearch={onSearch}
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
                style={{ width: '100%', borderColor: 'white', borderWidth: '2px', borderRadius: '10px', margin: '2% 0%'}}
              />
            </div>
            {isLoading && <div style={{height: "100%", width: '100%', background: "black", display: 'flex', justifyContent: 'center', alignItems: 'center'}}><Spin size='large' /></div>}
            
            {!isMobile &&
              <div style={{ flexGrow: 1, background: "black", padding: '0% 2.5%', overflowY: 'auto'}}>
              {!isMobile && !isLoading && lcaData && <LCATable lcaData={lcaData} />}
              </div>
            }

            <div style={{ maxHeight: '72%', background: "black", padding: '0% 2.5%', overflowY: 'hidden'}}>
                {isMobile && !isLoading && lcaData &&
                <div style={{ padding: '0% 2.5%', maxWidth: '95%', maxHeight: '80%'}}>
                  <LCATableMobile lcaData={lcaData} />
                </div>}
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
  )
}
