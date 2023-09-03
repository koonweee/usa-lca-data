import './globals.css'
import { Inter } from 'next/font/google'

export const metadata = {
  title: 'H1B1 Data Explorer',
  description:
    'A simple web app to explore H1B1 data from the US Department of Labor',
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>{children}</body>
    </html>
  )
}
