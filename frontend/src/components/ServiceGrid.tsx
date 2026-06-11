import ServiceCard from './ServiceCard'
import type { ServiceRecord } from '../types/service'

type ServiceGridProps = {
  services: ServiceRecord[]
}

function ServiceGrid({ services }: ServiceGridProps) {
  return (
    <section className="grid gap-4 pb-8 pt-4 sm:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </section>
  )
}

export default ServiceGrid
