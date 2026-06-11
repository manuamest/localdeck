export type ServiceRecord = {
  id: string
  title: string
  url: string
  display_url: string
  host: string
  port: number
  protocol: string
  status_code: number
  response_time_ms: number
  favicon_url: string | null
  last_seen: string
  last_checked: string
  error: string | null
}

export type ServicesResponse = {
  scanned_at: string | null
  scan_interval: number
  services: ServiceRecord[]
}
