import { useState } from 'react'

import type { ServiceRecord } from '../types/service'

type ServiceCardProps = {
  services: ServiceRecord[]
}

function getInitial(title: string) {
  return title.trim().charAt(0).toUpperCase() || '?'
}

function getPrimaryService(services: ServiceRecord[]) {
  return services.find((service) => service.protocol === 'http') ?? services[0]
}

function formatHint(value: string) {
  if (value === 'unknown') {
    return null
  }

  return value.replaceAll('_', ' ')
}

function openService(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function ServiceCard({ services }: ServiceCardProps) {
  const service = getPrimaryService(services)
  const faviconSource = services.find((candidate) => candidate.favicon_url)?.favicon_url ?? null
  const [faviconFailed, setFaviconFailed] = useState(false)
  const faviconUrl = faviconSource && !faviconFailed ? faviconSource : undefined

  return (
    <article
      className="service-card"
      role="link"
      tabIndex={0}
      aria-label={`Open ${service.title}`}
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest('a')) {
          return
        }

        openService(service.display_url)
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
          return
        }

        event.preventDefault()
        openService(service.display_url)
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
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
              <span className="text-lg font-bold text-[var(--color-cyan)]">{getInitial(service.title)}</span>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold tracking-[-0.02em] text-white">{service.title}</h2>
            <a
              href={service.display_url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block truncate text-sm font-medium text-[var(--color-accent-soft)] transition-colors hover:text-[var(--color-cyan)]"
            >
              {service.display_url}
            </a>
          </div>
        </div>

        <span className="badge shrink-0">{service.status_code}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {formatHint(service.runtime_hint) ? <span className="type-pill">{formatHint(service.runtime_hint)}</span> : null}
        {formatHint(service.framework_hint) ? <span className="type-pill type-pill-soft">{formatHint(service.framework_hint)}</span> : null}
      </div>

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
