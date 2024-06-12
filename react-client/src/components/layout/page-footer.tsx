export function PageFooter() {
  return (
    <footer className="py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by{" "}
          <a
            href={'https://github.com/koonweee'}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Jeremy
          </a>{", "}
          <a
            href={'https://github.com/chuyouchia'}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Jacob
          </a>{" and "}
          <a
            href={'https://github.com/iamgenechua'}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
          Gene
          </a>
          . Source code is available on{" "}
          <a
            href={'https://github.com/koonweee/h1b1-data'}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  )
}
