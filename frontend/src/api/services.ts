import type { ServicesResponse } from '../types/service'

export async function fetchServices(signal?: AbortSignal): Promise<ServicesResponse> {
  const response = await fetch('/api/services', { signal })

  if (!response.ok) {
    throw new Error(`Localdeck API returned ${response.status}`)
  }

  return response.json() as Promise<ServicesResponse>
}


export async function rescanServices(signal?: AbortSignal): Promise<ServicesResponse> {
  const response = await fetch('/api/scan', { method: 'POST', signal })

  if (!response.ok) {
    throw new Error(`Localdeck API returned ${response.status}`)
  }

  return response.json() as Promise<ServicesResponse>
}
