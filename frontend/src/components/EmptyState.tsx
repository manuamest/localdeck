function EmptyState() {
  return (
    <section className="grid flex-1 place-items-center pt-10">
      <div className="card max-w-2xl text-center">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cyan)]">
          current local reality
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-white sm:text-5xl">
          No web apps detected yet
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--color-text-muted)]">
          Start a local web server on a scanned port, for example
          <code className="mx-1 rounded-md border border-[var(--border-card)] bg-white/[0.045] px-1.5 py-0.5 text-[var(--color-text-soft)]">
            python -m http.server 8000
          </code>
          , and Localdeck will show it here after the next scan.
        </p>
      </div>
    </section>
  )
}

export default EmptyState
