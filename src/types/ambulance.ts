export interface AmbulanceLocation {
  id: string
  latitude: number
  longitude: number
  speed?: number
  heading?: number
  status: 'available' | 'en_route' | 'busy' | 'offline'
  driver?: string
  plateNumber?: string
  lastUpdate: string
}

export interface WebSocketMessage {
  type: 'location_update' | 'status_update' | 'connected' | 'error'
  data: AmbulanceLocation | AmbulanceLocation[] | string
}
