function LoadingState() {
  return (
    <section className="grid flex-1 place-items-center pt-10">
      <div className="card max-w-xl text-center">
        <span className="mx-auto block h-3 w-3 rounded-full bg-[var(--color-cyan)] shadow-[0_0_16px_rgba(97,175,239,0.9)]" />
        <h2 className="mt-5 text-3xl font-bold tracking-[-0.04em] text-white">Scanning localhost</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
          Checking common development ports and waiting for the first snapshot.
        </p>
      </div>
    </section>
  )
}

export default LoadingState
