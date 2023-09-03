import Link from 'next/link';

export default function Home(): JSX.Element {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <h1 className="pt-4 pb-8 bg-gradient-to-br from-black via-[#171717] to-[#575757] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
          Search H1B1 Sponsors. Explore Insights
      </h1>
      <div className="p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-5xl mx-auto w-full">
          <h1>The search box goes here</h1>
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
  )
}
