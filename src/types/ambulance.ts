export interface AmbulanceLocation {
  id: string
  ambulance_id?: string // Backend uses this field
  plateNumber?: string
  driver?: string
  latitude: number
  longitude: number
  speed?: number
  heading?: number // Add heading field
  accuracy?: number
  status: 'available' | 'en_route' | 'busy' | 'offline'
  lastUpdate: string | number
  timestamp?: number // Backend uses this field
}

export interface WebSocketMessage {
  type: 'initial_locations' | 'location_update' | 'status_update' | 'connected' | 'error'
  data?: AmbulanceLocation | AmbulanceLocation[] | string
  payload?: AmbulanceLocation | AmbulanceLocation[] // Can be single object or array
  target?: string // Backend includes target field
}
