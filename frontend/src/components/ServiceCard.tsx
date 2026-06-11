import { useState } from 'react'

import type { ServiceRecord } from '../types/service'

type ServiceCardProps = {
  service: ServiceRecord
}

function formatCheckedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}


function getInitial(title: string) {
  return title.trim().charAt(0).toUpperCase() || '?'
}

function ServiceCard({ service }: ServiceCardProps) {
  const [faviconFailed, setFaviconFailed] = useState(false)
  const faviconUrl = service.favicon_url && !faviconFailed ? service.favicon_url : undefined

  return (
    <article className="service-card">
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

      <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="metric-box">
          <dt>Port</dt>
          <dd>{service.port}</dd>
        </div>
        <div className="metric-box">
          <dt>Protocol</dt>
          <dd>{service.protocol.toUpperCase()}</dd>
        </div>
        <div className="metric-box">
          <dt>Response</dt>
          <dd>{service.response_time_ms}ms</dd>
        </div>
        <div className="metric-box">
          <dt>Checked</dt>
          <dd>{formatCheckedAt(service.last_checked)}</dd>
        </div>
      </dl>
    </article>
  )
}

export default ServiceCard
