import { useEffect, useState } from 'react'

import { fetchServices, rescanServices } from './api/services'
import EmptyState from './components/EmptyState'
import LoadingState from './components/LoadingState'
import ServiceGrid from './components/ServiceGrid'
import type { ServicesResponse } from './types/service'

const pollIntervalMs = 10_000

function App() {
  const [data, setData] = useState<ServicesResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRescanning, setIsRescanning] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadServices() {
      const controller = new AbortController()

      try {
        const nextData = await fetchServices(controller.signal)
        if (isMounted) {
          setData(nextData)
          setError(null)
        }
      } catch (caught) {
        if (isMounted) {
          setError(caught instanceof Error ? caught.message : 'Unable to reach Localdeck API')
        }
      }
    }

    void loadServices()
    const interval = window.setInterval(() => void loadServices(), pollIntervalMs)

    return () => {
      isMounted = false
      window.clearInterval(interval)
    }
  }, [])

  const services = data?.services ?? []

  async function handleRescan() {
    setIsRescanning(true)
    try {
      const nextData = await rescanServices()
      setData(nextData)
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to rescan localhost')
    } finally {
      setIsRescanning(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--gradient-bg)] px-4 py-5 font-tool text-[var(--color-text)] sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-7xl flex-col gap-6">
        <header className="command-deck">
          <img src="/favicon.svg" alt="Localdeck" className="h-11 w-11 rounded-2xl" />

          <div className="flex justify-end">
            <button className="tool-btn-primary" type="button" onClick={handleRescan} disabled={isRescanning}>
              {isRescanning ? 'Scanning...' : 'Rescan'}
            </button>
          </div>
        </header>

        {error ? (
          <section className="grid flex-1 place-items-center pt-10">
            <div className="card max-w-xl text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cyan)]">
                api connection
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-white">Backend unavailable</h2>
              <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">{error}</p>
            </div>
          </section>
        ) : data === null ? (
          <LoadingState />
        ) : services.length === 0 ? (
          <EmptyState />
        ) : (
          <ServiceGrid services={services} />
        )}
      </section>
    </main>
  )
}

export default App
