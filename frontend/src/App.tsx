import { useEffect, useState } from 'react'

import { fetchServices, rescanServices } from './api/services'
import EmptyState from './components/EmptyState'
import LoadingState from './components/LoadingState'
import ServiceGrid from './components/ServiceGrid'
import type { ServiceRecord, ServicesResponse } from './types/service'

const pollIntervalMs = 10_000
type TypeFilter = 'all' | 'docker' | 'python' | 'react' | 'ml' | 'other'
type SortMode = 'port' | 'title' | 'response'

function getServiceType(service: ServiceRecord): Exclude<TypeFilter, 'all'> {
  const title = service.title.toLowerCase()

  if (
    title.includes('portainer') ||
    title.includes('pgadmin') ||
    title.includes('adminer') ||
    title.includes('dozzle') ||
    title.includes('file browser') ||
    title.includes('it tools')
  ) {
    return 'docker'
  }

  if (
    title.includes('fastapi') ||
    title.includes('flask') ||
    title.includes('django') ||
    title.includes('uvicorn') ||
    title.includes('python') ||
    service.port === 8000 ||
    service.port === 8001
  ) {
    return 'python'
  }

  if (
    title.includes('react') ||
    title.includes('vite') ||
    title.includes('next.js') ||
    title.includes('nextjs') ||
    title.includes('vue') ||
    title.includes('svelte') ||
    [3000, 3001, 4173, 4200, 5173, 5500].includes(service.port)
  ) {
    return 'react'
  }

  if (
    title.includes('streamlit') ||
    title.includes('gradio') ||
    title.includes('ollama') ||
    title.includes('langflow') ||
    [7860, 8501, 11434].includes(service.port)
  ) {
    return 'ml'
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
          <img src="/favicon.svg?v=0.3.0" alt="Localdeck" className="h-11 w-11 rounded-2xl" />

          <div className="tool-controls">
            <label className="tool-select-label">
              Type
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}>
                <option value="all">All</option>
                <option value="docker">Docker/tools</option>
                <option value="python">Python</option>
                <option value="react">React/JS</option>
                <option value="ml">ML apps</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="tool-select-label">
              Sort
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
                <option value="port">Port</option>
                <option value="title">Title</option>
                <option value="response">Response</option>
              </select>
            </label>

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
