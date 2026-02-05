import { ref, onUnmounted } from 'vue'
import type { AmbulanceLocation, WebSocketMessage } from '@/types/ambulance'
import { ambulanceService } from '@/services/ambulanceService'

export const useAmbulanceTracking = () => {
  const ambulances = ref<Map<string, AmbulanceLocation>>(new Map())
  const isConnected = ref(false)
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const ws = ref<WebSocket | null>(null)

  // Transform backend ambulance data to frontend format
  const transformAmbulanceData = (ambulance: any): AmbulanceLocation => {
    return {
      id: ambulance.ambulance_id || ambulance.id,
      ambulance_id: ambulance.ambulance_id,
      plateNumber: ambulance.plateNumber || ambulance.plate_number,
      driver: ambulance.driver,
      latitude: ambulance.latitude,
      longitude: ambulance.longitude,
      speed: ambulance.speed,
      heading: ambulance.heading,
      accuracy: ambulance.accuracy,
      status: ambulance.status || 'available',
      lastUpdate: ambulance.timestamp || ambulance.lastUpdate || Date.now(),
      timestamp: ambulance.timestamp,
    }
  }

  // Fetch initial list of online ambulances
  const fetchOnlineAmbulances = async () => {
    isLoading.value = true
    error.value = null

    try {
      console.log('[API] Fetching online ambulances...')
      const onlineAmbulances = await ambulanceService.getOnlineAmbulances()

      console.log('[API] Response received:', {
        count: onlineAmbulances?.length || 0,
        data: onlineAmbulances,
      })

      // Clear existing ambulances and populate with fresh data
      ambulances.value.clear()

      if (Array.isArray(onlineAmbulances) && onlineAmbulances.length > 0) {
        onlineAmbulances.forEach((ambulance) => {
          const transformed = transformAmbulanceData(ambulance)
          ambulances.value.set(transformed.id, transformed)
        })
        console.log(`[API] ✅ Loaded ${onlineAmbulances.length} online ambulances`)
      } else {
        console.log('[API] ⚠️ No online ambulances found')
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Failed to fetch online ambulances'
      console.error('[API] ❌ Error fetching online ambulances:', {
        error: e,
        message: e.message,
        response: e.response?.data,
      })
    } finally {
      isLoading.value = false
    }
  }

  const connect = () => {
    const token = localStorage.getItem('token')

    if (!token) {
      error.value = 'No authentication token found'
      console.error('[WebSocket] ❌ No authentication token found')
      return
    }

    const wsUrl = `ws://localhost:8080/api/ambulance/ws/web?token=${token}`
    console.log('[WebSocket] 🔌 Attempting to connect to:', wsUrl.replace(token, '***TOKEN***'))

    try {
      ws.value = new WebSocket(wsUrl)

      ws.value.onopen = () => {
        isConnected.value = true
        error.value = null
        console.log('[WebSocket] ✅ Connected successfully')
        console.log('[WebSocket] ReadyState:', ws.value?.readyState)

        // Fetch initial list when WebSocket connects
        fetchOnlineAmbulances()
      }

      ws.value.onmessage = (event) => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('[WebSocket] 📨 RAW MESSAGE RECEIVED')
        console.log('[WebSocket] Timestamp:', new Date().toISOString())
        console.log('[WebSocket] Raw Data Type:', typeof event.data)
        console.log('[WebSocket] Raw Data:', event.data)

        try {
          const message: WebSocketMessage = JSON.parse(event.data)

          console.log('[WebSocket] 📦 PARSED MESSAGE')
          console.log('[WebSocket] Message Type:', message.type)
          console.log('[WebSocket] Message Data Type:', typeof message.data)
          console.log('[WebSocket] Message Data:', message.data)
          console.log('[WebSocket] Message Payload Type:', typeof message.payload)
          console.log('[WebSocket] Message Payload:', message.payload)
          console.log('[WebSocket] Message Target:', message.target)
          console.log('[WebSocket] Full Message Object:', JSON.stringify(message, null, 2))

          handleMessage(message)

          console.log('[WebSocket] Current Ambulance Count:', ambulances.value.size)
          console.log('[WebSocket] Ambulance IDs:', Array.from(ambulances.value.keys()))
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        } catch (e) {
          console.error('[WebSocket] ❌ Failed to parse message')
          console.error('[WebSocket] Parse Error:', e)
          console.error('[WebSocket] Raw data that failed:', event.data)
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        }
      }

      ws.value.onerror = (event) => {
        console.error('[WebSocket] ❌ ERROR EVENT')
        console.error('[WebSocket] Error Event:', event)
        console.error('[WebSocket] ReadyState:', ws.value?.readyState)
        error.value = 'WebSocket connection error'
      }

      ws.value.onclose = (event) => {
        isConnected.value = false
        console.log('[WebSocket] 🔌 CONNECTION CLOSED')
        console.log('[WebSocket] Close Code:', event.code)
        console.log('[WebSocket] Close Reason:', event.reason || 'No reason provided')
        console.log('[WebSocket] Was Clean:', event.wasClean)
        console.log('[WebSocket] Timestamp:', new Date().toISOString())

        // Attempt to reconnect after 5 seconds
        if (event.code !== 1000) {
          console.log('[WebSocket] 🔄 Attempting to reconnect in 5 seconds...')
          setTimeout(() => {
            console.log('[WebSocket] 🔄 Reconnecting now...')
            connect()
          }, 5000)
        }
      }
    } catch (e) {
      error.value = 'Failed to establish WebSocket connection'
      console.error('[WebSocket] ❌ Exception during connection:', e)
    }
  }

  const handleMessage = (message: WebSocketMessage) => {
    console.log('[WebSocket Handler] 🔧 Processing message type:', message.type)

    switch (message.type) {
      case 'initial_locations':
        console.log('[WebSocket Handler] 🏁 Processing initial locations')

        if (Array.isArray(message.payload)) {
          console.log('[WebSocket Handler] 🏁 Initial ambulances count:', message.payload.length)
          message.payload.forEach((ambulance, index) => {
            const transformed = transformAmbulanceData(ambulance)
            console.log(`[WebSocket Handler] 🏁 Ambulance ${index + 1}:`, {
              id: transformed.id,
              latitude: transformed.latitude,
              longitude: transformed.longitude,
              speed: transformed.speed,
              accuracy: transformed.accuracy,
              timestamp: transformed.timestamp,
            })
            ambulances.value.set(transformed.id, transformed)
          })
          console.log('[WebSocket Handler] ✅ Loaded', message.payload.length, 'initial ambulances')
        } else {
          console.warn(
            '[WebSocket Handler] ⚠️ Unexpected payload format for initial_locations:',
            message.payload,
          )
        }
        break

      case 'location_update':
        console.log('[WebSocket Handler] 📍 Processing location update')

        // Try payload first (backend format), then fall back to data
        const locationData = message.payload || message.data

        if (Array.isArray(locationData)) {
          console.log('[WebSocket Handler] 📍 Array of ambulances:', locationData.length)
          locationData.forEach((ambulance, index) => {
            const transformed = transformAmbulanceData(ambulance)
            console.log(`[WebSocket Handler] 📍 Ambulance ${index + 1}:`, {
              id: transformed.id,
              latitude: transformed.latitude,
              longitude: transformed.longitude,
              speed: transformed.speed,
              heading: transformed.heading,
              status: transformed.status,
            })
            ambulances.value.set(transformed.id, transformed)
          })
          console.log('[WebSocket Handler] ✅ Updated', locationData.length, 'ambulances')
        } else if (typeof locationData === 'object' && locationData !== null) {
          const transformed = transformAmbulanceData(locationData)
          console.log('[WebSocket Handler] 📍 Single ambulance update:', {
            id: transformed.id,
            latitude: transformed.latitude,
            longitude: transformed.longitude,
            speed: transformed.speed,
            heading: transformed.heading,
            status: transformed.status,
          })
          ambulances.value.set(transformed.id, transformed)
          console.log('[WebSocket Handler] ✅ Updated ambulance:', transformed.id)
        } else {
          console.warn(
            '[WebSocket Handler] ⚠️ Unexpected data format for location_update:',
            locationData,
          )
        }
        break

      case 'status_update':
        console.log('[WebSocket Handler] 🔄 Processing status update')

        // Try payload first, then fall back to data
        const statusData = message.payload || message.data

        if (typeof statusData === 'object' && statusData !== null && 'id' in statusData) {
          const transformed = transformAmbulanceData(statusData)
          console.log('[WebSocket Handler] 🔄 Status update for:', {
            id: transformed.id,
            status: transformed.status,
            plateNumber: transformed.plateNumber,
          })
          ambulances.value.set(transformed.id, transformed)
          console.log('[WebSocket Handler] ✅ Status updated for ambulance:', transformed.id)
        } else {
          console.warn(
            '[WebSocket Handler] ⚠️ Unexpected data format for status_update:',
            statusData,
          )
        }
        break

      case 'connected':
        console.log('[WebSocket Handler] ✅ Connection confirmed by server')
        console.log('[WebSocket Handler] Server message:', message.data || message.payload)
        break

      case 'error':
        console.error('[WebSocket Handler] ❌ Error from server:', message.data || message.payload)
        error.value = (message.data || message.payload) as string
        break

      default:
        console.warn('[WebSocket Handler] ⚠️ Unknown message type:', message.type)
        console.warn('[WebSocket Handler] Message data:', message.data)
        console.warn('[WebSocket Handler] Message payload:', message.payload)
        break
    }

    console.log('[WebSocket Handler] 📊 Current state:')
    console.log('[WebSocket Handler] Total ambulances:', ambulances.value.size)
    console.log('[WebSocket Handler] Ambulance map:', Array.from(ambulances.value.entries()))
  }

  const disconnect = () => {
    if (ws.value) {
      console.log('[WebSocket] 🔌 Manually disconnecting...')
      ws.value.close(1000, 'User disconnected')
      ws.value = null
    }
    isConnected.value = false
    console.log('[WebSocket] ✅ Disconnected')
  }

  const getAmbulanceList = () => {
    const list = Array.from(ambulances.value.values())
    console.log('[Composable] 📋 Getting ambulance list, count:', list.length)
    return list
  }

  // Refresh the list of online ambulances
  const refreshAmbulances = async () => {
    console.log('[Composable] 🔄 Manual refresh triggered')
    await fetchOnlineAmbulances()
  }

  onUnmounted(() => {
    console.log('[Composable] 🧹 Component unmounting, cleaning up...')
    disconnect()
  })

  return {
    ambulances,
    isConnected,
    error,
    isLoading,
    connect,
    disconnect,
    getAmbulanceList,
    fetchOnlineAmbulances,
    refreshAmbulances,
  }
}
