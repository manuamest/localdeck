import ServiceCard from './ServiceCard'
import type { ServiceRecord } from '../types/service'

type CardProps = {
  favorites: string[]
  aliases: Record<string, string>
  onToggleFavorite: (id: string) => void
  onSetAlias: (id: string, alias: string) => void
  onToggleArchive: (id: string) => void
  onRemovePinned: (id: string) => void
}

type ServiceGridProps = {
  services: ServiceRecord[]
  cardProps: CardProps
  isArchived?: boolean
}

function groupServices(services: ServiceRecord[]) {
  const groups = new Map<string, ServiceRecord[]>()

  for (const service of services) {
    const title = service.title.trim().toLowerCase()
    const isGenericTitle = title.startsWith('service on port ')
    const key = isGenericTitle ? service.id : `${service.host}:${title}`
    groups.set(key, [...(groups.get(key) ?? []), service])
  }

  return Array.from(groups.values())
}

function ServiceGrid({ services, cardProps, isArchived = false }: ServiceGridProps) {
  const groups = groupServices(services)

  return (
    <section className="grid gap-4 pb-8 pt-4 sm:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => {
        const primary = group.find((s) => s.protocol === 'http') ?? group[0]
        return (
          <ServiceCard
            key={group.map((s) => s.id).join('|')}
            services={group}
            isFavorite={cardProps.favorites.includes(primary.id)}
            alias={cardProps.aliases[primary.id]}
            isArchived={isArchived}
            onToggleFavorite={() => cardProps.onToggleFavorite(primary.id)}
            onSetAlias={(alias) => cardProps.onSetAlias(primary.id, alias)}
            onArchive={() => cardProps.onToggleArchive(primary.id)}
            onRemovePinned={primary.source === 'manual' ? () => cardProps.onRemovePinned(primary.id) : undefined}
          />
        )
      })}
    </section>
  )
}

export default ServiceGrid
