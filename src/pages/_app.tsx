import { AppType } from 'next/app'
import './globals.css'
import { withTRPC } from "@trpc/next";
import { ServerRouter } from '@/server/router';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'H1B1 Data Explorer',
  description:
    'A simple web app to explore H1B1 data from the US Department of Labor',
}

const App: AppType = ({ Component, pageProps }) => {
  return (
      <><Component {...pageProps} /><Analytics /></>
  )
}

export default withTRPC<ServerRouter>({
  config({ ctx }) {
    const url = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://h1b1-data.vercel.app/api/trpc`
      : "http://localhost:3000/api/trpc";

    return { url };
  },
  ssr: false,
})(App);
