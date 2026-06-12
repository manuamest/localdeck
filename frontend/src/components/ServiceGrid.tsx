import ServiceCard from './ServiceCard'
import type { ServiceRecord } from '../types/service'

type ServiceGridProps = {
  services: ServiceRecord[]
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

function ServiceGrid({ services }: ServiceGridProps) {
  const groups = groupServices(services)

  return (
    <section className="grid gap-4 pb-8 pt-4 sm:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => (
        <ServiceCard key={group.map((service) => service.id).join('|')} services={group} />
      ))}
    </section>
  )
}

export default ServiceGrid
