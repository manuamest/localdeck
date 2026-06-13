import { useEffect, useState } from 'react'

import { fetchServices, rescanServices } from './api/services'
import EmptyState from './components/EmptyState'
import LoadingState from './components/LoadingState'
import ServiceGrid from './components/ServiceGrid'
import type { ServiceRecord, ServicesResponse } from './types/service'

const pollIntervalMs = 10_000
type TypeFilter = 'all' | 'docker' | 'python' | 'react' | 'ml' | 'other'
type SortMode = 'port' | 'title' | 'response'

const typeFilters: Array<{ value: TypeFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'react', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'docker', label: 'Docker' },
  { value: 'ml', label: 'ML' },
  { value: 'other', label: 'Other' },
]

const sortModes: Array<{ value: SortMode; label: string }> = [
  { value: 'port', label: 'Port' },
  { value: 'title', label: 'Name' },
  { value: 'response', label: 'Fastest' },
]

function getServiceType(service: ServiceRecord): Exclude<TypeFilter, 'all'> {
  if (service.runtime_hint === 'javascript') {
    return 'react'
  }

  if (service.runtime_hint === 'python' || service.runtime_hint === 'docker' || service.runtime_hint === 'ml') {
    return service.runtime_hint
  }

  return 'other'
}

function filterAndSortServices(services: ServiceRecord[], typeFilter: TypeFilter, sortMode: SortMode) {
  const filtered = services.filter((service) => {
    return typeFilter === 'all' || getServiceType(service) === typeFilter
  })

  return filtered.sort((first, second) => {
    if (sortMode === 'title') {
      return first.title.localeCompare(second.title, undefined, { sensitivity: 'base' }) || first.port - second.port
    }

    if (sortMode === 'response') {
      return first.response_time_ms - second.response_time_ms || first.port - second.port
    }

    return first.port - second.port || first.protocol.localeCompare(second.protocol)
  })
}

function App() {
  const [data, setData] = useState<ServicesResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRescanning, setIsRescanning] = useState(false)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [sortMode, setSortMode] = useState<SortMode>('port')

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
  const visibleServices = filterAndSortServices(services, typeFilter, sortMode)

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
          <div className="brand-lockup">
            <img src="/favicon.svg?v=1.0.0" alt="" className="h-11 w-11 rounded-2xl" />
            <div>
              <p className="brand-kicker">Localdeck</p>
              <h1 className="brand-title">Local apps running now</h1>
            </div>
          </div>

          <div className="tool-controls">
            <div className="tool-group" aria-label="Filter by app type">
              {typeFilters.map((filter) => (
                <button
                  key={filter.value}
                  className={`tool-chip ${typeFilter === filter.value ? 'tool-chip-active' : ''}`}
                  type="button"
                  onClick={() => setTypeFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="tool-group tool-group-quiet" aria-label="Order services">
              {sortModes.map((mode) => (
                <button
                  key={mode.value}
                  className={`tool-chip ${sortMode === mode.value ? 'tool-chip-active' : ''}`}
                  type="button"
                  onClick={() => setSortMode(mode.value)}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <button
              className="tool-btn-icon"
              type="button"
              onClick={handleRescan}
              disabled={isRescanning}
              aria-label="Rescan localhost"
              title="Rescan localhost"
            >
              <svg
                className={isRescanning ? 'animate-spin' : ''}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M20 12a8 8 0 0 1-13.66 5.66M4 12A8 8 0 0 1 17.66 6.34M17 2v5h5M7 22v-5H2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
        ) : visibleServices.length === 0 ? (
          <section className="grid flex-1 place-items-center pt-10">
            <div className="card max-w-xl text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cyan)]">
                no matching services
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-white">Try a wider filter</h2>
              <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
                Localdeck found {services.length} service{services.length === 1 ? '' : 's'}, but none match the current view.
              </p>
            </div>
          </section>
        ) : (
          <ServiceGrid services={visibleServices} />
        )}
      </section>
    </main>
  )
}

export default App
