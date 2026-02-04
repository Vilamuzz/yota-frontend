import { ref, onUnmounted } from 'vue'
import type { AmbulanceLocation, WebSocketMessage } from '@/types/ambulance'
import { ambulanceService } from '@/services/ambulanceService'

export const useAmbulanceTracking = () => {
  const ambulances = ref<Map<string, AmbulanceLocation>>(new Map())
  const isConnected = ref(false)
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const ws = ref<WebSocket | null>(null)

  // Fetch initial list of online ambulances
  const fetchOnlineAmbulances = async () => {
    try {
      isLoading.value = true
      const onlineAmbulances = await ambulanceService.getOnlineAmbulances()
      ambulances.value.clear()
      onlineAmbulances.forEach((ambulance) => {
        ambulances.value.set(ambulance.id, ambulance)
      })
      error.value = null
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Failed to fetch online ambulances'
      console.error('Error fetching online ambulances:', e)
    } finally {
      isLoading.value = false
    }
  }

  const connect = () => {
    const token = localStorage.getItem('token')

    if (!token) {
      error.value = 'No authentication token found'
      return
    }

    const wsUrl = `ws://localhost:8080/api/ambulance/ws/web?token=${token}`

    try {
      ws.value = new WebSocket(wsUrl)

      ws.value.onopen = () => {
        isConnected.value = true
        error.value = null
        console.log('WebSocket connected')

        // Fetch initial list when WebSocket connects
        fetchOnlineAmbulances()
      }

      ws.value.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          handleMessage(message)
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e)
        }
      }

      ws.value.onerror = (event) => {
        console.error('WebSocket error:', event)
        error.value = 'WebSocket connection error'
      }

      ws.value.onclose = (event) => {
        isConnected.value = false
        console.log('WebSocket closed:', event.code, event.reason)

        // Attempt to reconnect after 5 seconds
        if (event.code !== 1000) {
          setTimeout(() => {
            console.log('Attempting to reconnect...')
            connect()
          }, 5000)
        }
      }
    } catch (e) {
      error.value = 'Failed to establish WebSocket connection'
      console.error(e)
    }
  }

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'location_update':
        if (Array.isArray(message.data)) {
          message.data.forEach((ambulance) => {
            ambulances.value.set(ambulance.id, ambulance)
          })
        } else if (typeof message.data === 'object') {
          const ambulance = message.data as AmbulanceLocation
          ambulances.value.set(ambulance.id, ambulance)
        }
        break
      case 'status_update':
        if (typeof message.data === 'object' && 'id' in message.data) {
          const ambulance = message.data as AmbulanceLocation
          ambulances.value.set(ambulance.id, ambulance)
        }
        break
      case 'connected':
        console.log('Successfully connected to tracking service')
        break
      case 'error':
        error.value = message.data as string
        break
    }
  }

  const disconnect = () => {
    if (ws.value) {
      ws.value.close(1000, 'User disconnected')
      ws.value = null
    }
    isConnected.value = false
  }

  const getAmbulanceList = () => {
    return Array.from(ambulances.value.values())
  }

  // Refresh the list of online ambulances
  const refreshAmbulances = async () => {
    await fetchOnlineAmbulances()
  }

  onUnmounted(() => {
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
