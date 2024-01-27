import Link from 'next/link';
import { Layout, Typography } from 'antd';
import { CustomSelectSearch } from '@/components/custom-search';
import { useState, useEffect } from 'react';

const { Title } = Typography;

export default function Page(): JSX.Element {

  const [isMobile, setIsMobile] = useState<boolean>(true);

  // useEffect(() => {
  //   if (
  //     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(
  //       navigator.userAgent
  //     )
  //   ) {
  //     setIsMobile(true);
  //   } else {
  //     setIsMobile(false);
  //   }
  // }, []);

  return (
    <Layout style={{height:"100vh", width: '100vw', background: "black"}}>
        <main className="relative flex min-h-screen flex-col items-center justify-center" >
        <Title style={{textAlign: "center", margin: "20% 10% 10% 10%", fontSize: isMobile? '6vh' : '10vh'}}>
          <div className="animation-text">
            Search H1B1 data, explore insights.
          </div>
        </Title>
        <div className="p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-5xl mx-auto w-full">
            <CustomSelectSearch />
        </div>
        <p className="font-light text-gray-600 w-full max-w-lg text-center mt-6">
        Built by{' '}
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
        .
        </p>
        </main>
      </Layout>

  )
}
