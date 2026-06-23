import { useEffect, useState } from 'react'

import { fetchServices, rescanServices } from './api/services'
import ServiceGrid from './components/ServiceGrid'
import type { Prefs, PinnedService, ServiceRecord, ServicesResponse } from './types/service'

const pollIntervalMs = 10_000
const PREFS_KEY = 'localdeck_prefs'
const DEFAULT_PREFS: Prefs = { favorites: [], aliases: {}, archived: [], pinned: [] }

type TypeFilter = 'all' | 'docker' | 'python' | 'react' | 'ml' | 'other'
type SortMode = 'port' | 'title'

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
]

function getServiceType(service: ServiceRecord): Exclude<TypeFilter, 'all'> {
  if (service.runtime_hint === 'javascript') return 'react'
  if (service.runtime_hint === 'python' || service.runtime_hint === 'docker' || service.runtime_hint === 'ml') {
    return service.runtime_hint
  }
  return 'other'
}

function filterAndSortServices(
  services: ServiceRecord[],
  typeFilter: TypeFilter,
  sortMode: SortMode,
  favorites: string[],
  aliases: Record<string, string>,
) {
  const filtered = services.filter((s) => typeFilter === 'all' || getServiceType(s) === typeFilter)

  return filtered.sort((a, b) => {
    const favDiff = (favorites.includes(a.id) ? 0 : 1) - (favorites.includes(b.id) ? 0 : 1)
    if (favDiff !== 0) return favDiff
    if (sortMode === 'title') {
      const aTitle = aliases[a.id] ?? a.title
      const bTitle = aliases[b.id] ?? b.title
      return aTitle.localeCompare(bTitle, undefined, { sensitivity: 'base' }) || a.port - b.port
    }
    return a.port - b.port || a.protocol.localeCompare(b.protocol)
  })
}

function pinnedToRecord(p: PinnedService): ServiceRecord {
  let port = 80
  let host = ''
  let protocol = 'http'
  try {
    const u = new URL(p.url)
    port = parseInt(u.port) || (u.protocol === 'https:' ? 443 : 80)
    host = u.hostname
    protocol = u.protocol.replace(':', '')
  } catch { /* invalid URL, keep defaults */ }

  return {
    id: p.id,
    title: p.name,
    url: p.url,
    display_url: p.url,
    host,
    port,
    protocol,
    status_code: 0,
    response_time_ms: 0,
    favicon_url: null,
    source: 'manual',
    runtime_hint: 'unknown',
    framework_hint: 'unknown',
    confidence: 0,
    evidence: [],
    last_seen: new Date().toISOString(),
    last_checked: new Date().toISOString(),
    error: null,
  }
}

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS
  } catch {
    return DEFAULT_PREFS
  }
}

function App() {
  const [data, setData] = useState<ServicesResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRescanning, setIsRescanning] = useState(false)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [sortMode, setSortMode] = useState<SortMode>('port')
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newName, setNewName] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadServices() {
      try {
        const nextData = await fetchServices()
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

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  }, [prefs])

  function toggleFavorite(id: string) {
    setPrefs((p) => ({
      ...p,
      favorites: p.favorites.includes(id) ? p.favorites.filter((f) => f !== id) : [...p.favorites, id],
    }))
  }

  function setAlias(id: string, alias: string) {
    setPrefs((p) => {
      const aliases = { ...p.aliases }
      if (alias.trim()) aliases[id] = alias.trim()
      else delete aliases[id]
      return { ...p, aliases }
    })
  }

  function toggleArchive(id: string) {
    setPrefs((p) => ({
      ...p,
      archived: p.archived.includes(id) ? p.archived.filter((a) => a !== id) : [...p.archived, id],
    }))
  }

  function removePinned(id: string) {
    setPrefs((p) => ({
      ...p,
      pinned: p.pinned.filter((x) => x.id !== id),
      archived: p.archived.filter((a) => a !== id),
      favorites: p.favorites.filter((f) => f !== id),
    }))
  }

  function handleAddPinned() {
    let url = newUrl.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) url = 'http://' + url
    let name = newName.trim()
    if (!name) {
      try {
        const u = new URL(url)
        name = u.hostname + (u.port ? ':' + u.port : '')
      } catch {
        name = url
      }
    }
    const id = 'pinned-' + btoa(url).replace(/[^a-z0-9]/gi, '').slice(0, 16)
    setPrefs((p) => ({ ...p, pinned: [...p.pinned.filter((x) => x.id !== id), { id, name, url }] }))
    setNewUrl('')
    setNewName('')
    setShowAddForm(false)
  }

  const allServices = [...(data?.services ?? []), ...prefs.pinned.map(pinnedToRecord)]
  const activeServices = allServices.filter((s) => !prefs.archived.includes(s.id))
  const archivedServices = allServices.filter((s) => prefs.archived.includes(s.id))
  const visibleServices = filterAndSortServices(activeServices, typeFilter, sortMode, prefs.favorites, prefs.aliases)

  const cardProps = {
    favorites: prefs.favorites,
    aliases: prefs.aliases,
    onToggleFavorite: toggleFavorite,
    onSetAlias: setAlias,
    onToggleArchive: toggleArchive,
    onRemovePinned: removePinned,
  }

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
              onClick={() => setShowAddForm((v) => !v)}
              aria-label="Add service"
              title="Add service manually"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>

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

        {showAddForm && (
          <form
            className="card flex flex-wrap items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              handleAddPinned()
            }}
          >
            <input
              autoFocus
              type="text"
              placeholder="URL — e.g. http://localhost:7777"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="add-input min-w-0 flex-1"
            />
            <input
              type="text"
              placeholder="Name (optional)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="add-input w-44"
            />
            <button type="submit" className="tool-chip tool-chip-active">
              Add
            </button>
            <button type="button" className="tool-chip" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </form>
        )}

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
          <section className="grid flex-1 place-items-center pt-10">
            <div className="card max-w-xl text-center">
              <span className="mx-auto block h-3 w-3 rounded-full bg-[var(--color-cyan)] shadow-[0_0_16px_rgba(97,175,239,0.9)]" />
              <h2 className="mt-5 text-3xl font-bold tracking-[-0.04em] text-white">Scanning localhost</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                Checking common development ports and waiting for the first snapshot.
              </p>
            </div>
          </section>
        ) : allServices.length === 0 ? (
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
                , or use the{' '}
                <button
                  type="button"
                  className="font-bold text-[var(--color-accent-soft)] underline underline-offset-2"
                  onClick={() => setShowAddForm(true)}
                >
                  + button
                </button>{' '}
                to add one manually.
              </p>
            </div>
          </section>
        ) : visibleServices.length === 0 ? (
          <section className="grid flex-1 place-items-center pt-10">
            <div className="card max-w-xl text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-cyan)]">
                no matching services
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-white">Try a wider filter</h2>
              <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
                {activeServices.length === 0
                  ? 'All services are archived.'
                  : `Localdeck found ${activeServices.length} service${activeServices.length === 1 ? '' : 's'}, but none match the current view.`}
              </p>
            </div>
          </section>
        ) : (
          <ServiceGrid services={visibleServices} cardProps={cardProps} />
        )}

        {archivedServices.length > 0 && (
          <details className="archived-section">
            <summary className="archived-summary">Archived ({archivedServices.length})</summary>
            <div className="px-4 pb-4">
              <ServiceGrid services={archivedServices} cardProps={cardProps} isArchived />
            </div>
          </details>
        )}
      </section>
    </main>
  )
}

export default App
