import { useRef, useState } from 'react'

import type { ServiceRecord } from '../types/service'

type ServiceCardProps = {
  services: ServiceRecord[]
  isFavorite: boolean
  alias?: string
  isArchived: boolean
  onToggleFavorite: () => void
  onSetAlias: (alias: string) => void
  onArchive: () => void
  onRemovePinned?: () => void
}

function getPrimaryService(services: ServiceRecord[]) {
  return services.find((s) => s.protocol === 'http') ?? services[0]
}

function formatHint(value: string) {
  if (value === 'unknown') return null
  return value.replaceAll('_', ' ')
}

function openService(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function ServiceCard({
  services,
  isFavorite,
  alias,
  isArchived,
  onToggleFavorite,
  onSetAlias,
  onArchive,
  onRemovePinned,
}: ServiceCardProps) {
  const service = getPrimaryService(services)
  const faviconSource = services.find((s) => s.favicon_url)?.favicon_url ?? null
  const [faviconFailed, setFaviconFailed] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const faviconUrl = faviconSource && !faviconFailed ? faviconSource : undefined
  const displayTitle = alias ?? service.title
  const isManual = service.source === 'manual'

  function startEditing() {
    setEditValue(alias ?? service.title)
    setIsEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commitEdit() {
    onSetAlias(editValue)
    setIsEditing(false)
  }

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    void navigator.clipboard.writeText(service.display_url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  function handleArchiveClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (isArchived && isManual && onRemovePinned) {
      onRemovePinned()
    } else {
      onArchive()
    }
  }

  return (
    <article
      className="service-card group"
      role="link"
      tabIndex={0}
      aria-label={`Open ${displayTitle}`}
      onClick={(event) => {
        const target = event.target
        if (target instanceof Element && (target.closest('a') || target.closest('button') || target.closest('input'))) {
          return
        }
        openService(service.display_url)
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        if (isEditing) return
        event.preventDefault()
        openService(service.display_url)
      }}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-[var(--border-card)] bg-white/[0.045]">
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt=""
              className="h-6 w-6"
              loading="lazy"
              onError={() => setFaviconFailed(true)}
            />
          ) : (
            <span className="text-lg font-bold text-[var(--color-cyan)]">
              {displayTitle.trim().charAt(0).toUpperCase() || '?'}
            </span>
          )}
        </div>

        {/* Title + URL */}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            {isEditing ? (
              <input
                ref={inputRef}
                className="alias-input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation()
                  if (e.key === 'Enter') commitEdit()
                  if (e.key === 'Escape') setIsEditing(false)
                }}
                onBlur={commitEdit}
              />
            ) : (
              <h2 className="truncate text-lg font-bold tracking-[-0.02em] text-white">{displayTitle}</h2>
            )}
            {!isEditing && (
              <button
                className="card-icon-btn shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                type="button"
                title="Rename"
                onClick={(e) => {
                  e.stopPropagation()
                  startEditing()
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="mt-1 flex min-w-0 items-center gap-1">
            <a
              href={service.display_url}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-sm font-medium text-[var(--color-accent-soft)] transition-colors hover:text-[var(--color-cyan)]"
            >
              {service.display_url}
            </a>
            <button
              className="card-icon-btn shrink-0"
              type="button"
              title={copied ? 'Copied!' : 'Copy URL'}
              onClick={handleCopy}
            >
              {copied ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="var(--color-cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Star + Badge */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            className={`card-icon-btn ${isFavorite ? 'card-icon-btn-star-active' : ''}`}
            type="button"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                fill={isFavorite ? 'currentColor' : 'none'}
              />
            </svg>
          </button>

          {isManual ? (
            <span className="badge-manual">manual</span>
          ) : (
            <span className="badge shrink-0">{service.status_code}</span>
          )}
        </div>
      </div>

      {/* Pills + Archive button */}
      <div className="mt-4 flex items-end justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {formatHint(service.runtime_hint) ? (
            <span className="type-pill">{formatHint(service.runtime_hint)}</span>
          ) : null}
          {formatHint(service.framework_hint) ? (
            <span className="type-pill type-pill-soft">{formatHint(service.framework_hint)}</span>
          ) : null}
        </div>

        <button
          className="shrink-0 text-[0.7rem] font-semibold text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-soft)]"
          type="button"
          onClick={handleArchiveClick}
        >
          {isArchived ? (isManual ? 'Remove' : 'Restore') : 'Hide'}
        </button>
      </div>

      {/* Endpoint chips */}
      {services.length > 1 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {services.map((endpoint) => (
            <a
              key={endpoint.id}
              href={endpoint.display_url}
              target="_blank"
              rel="noreferrer"
              className={`endpoint-chip ${endpoint.id === service.id ? 'endpoint-chip-primary' : ''}`}
              title={endpoint.display_url}
            >
              {endpoint.protocol.toUpperCase()} :{endpoint.port}
            </a>
          ))}
        </div>
      ) : null}
    </article>
  )
}

export default ServiceCard
