<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAmbulanceTracking } from '@/composables/useAmbulanceTracking'
import type { AmbulanceLocation } from '@/types/ambulance'

// Fix Leaflet default marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const mapContainer = ref<HTMLDivElement | null>(null)
const map = shallowRef<L.Map | null>(null)
const markers = shallowRef<Map<string, L.Marker>>(new Map())

const { ambulances, isConnected, error, connect, disconnect, getAmbulanceList } =
  useAmbulanceTracking()

// Custom ambulance icon
const createAmbulanceIcon = (status: AmbulanceLocation['status']) => {
  const colors = {
    available: '#22c55e',
    en_route: '#f59e0b',
    busy: '#ef4444',
    offline: '#6b7280',
  }

  return L.divIcon({
    className: 'custom-ambulance-marker',
    html: `
      <div style="
        background-color: ${colors[status]};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      ">
        🚑
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  })
}

const initMap = () => {
  if (!mapContainer.value) return

  // Initialize map centered on Indonesia (or your preferred location)
  const leafletMap = L.map(mapContainer.value).setView([-6.2088, 106.8456], 12)
  map.value = leafletMap

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(leafletMap)
}

const updateMarkers = () => {
  if (!map.value) return

  const ambulanceList = getAmbulanceList()

  // Update or create markers for each ambulance
  ambulanceList.forEach((ambulance) => {
    const existingMarker = markers.value.get(ambulance.id)

    if (existingMarker) {
      // Update existing marker position with animation
      existingMarker.setLatLng([ambulance.latitude, ambulance.longitude])
      existingMarker.setIcon(createAmbulanceIcon(ambulance.status))

      // Update popup content
      existingMarker.setPopupContent(createPopupContent(ambulance))
    } else {
      // Create new marker
      const marker = L.marker([ambulance.latitude, ambulance.longitude], {
        icon: createAmbulanceIcon(ambulance.status),
      })
        .addTo(map.value!)
        .bindPopup(createPopupContent(ambulance))

      markers.value.set(ambulance.id, marker)
    }
  })

  // Remove markers for ambulances that no longer exist
  markers.value.forEach((marker, id) => {
    if (!ambulances.value.has(id)) {
      marker.remove()
      markers.value.delete(id)
    }
  })
}

const createPopupContent = (ambulance: AmbulanceLocation): string => {
  const statusColors = {
    available: 'text-green-600',
    en_route: 'text-amber-600',
    busy: 'text-red-600',
    offline: 'text-gray-600',
  }

  return `
    <div class="p-2 min-w-[200px]">
      <h3 class="font-bold text-lg mb-2">🚑 ${ambulance.plateNumber || 'Ambulance'}</h3>
      <div class="space-y-1 text-sm">
        <p><strong>ID:</strong> ${ambulance.id}</p>
        <p><strong>Driver:</strong> ${ambulance.driver || 'N/A'}</p>
        <p><strong>Status:</strong> <span class="${statusColors[ambulance.status]} font-semibold">${ambulance.status.toUpperCase()}</span></p>
        <p><strong>Speed:</strong> ${ambulance.speed ? `${ambulance.speed} km/h` : 'N/A'}</p>
        <p><strong>Last Update:</strong> ${new Date(ambulance.lastUpdate).toLocaleTimeString()}</p>
      </div>
    </div>
  `
}

// Watch for changes in ambulances data
watch(
  () => ambulances.value.size,
  () => {
    updateMarkers()
  },
  { deep: true },
)

// Also watch the ambulances Map for updates
watch(
  ambulances,
  () => {
    updateMarkers()
  },
  { deep: true },
)

onMounted(() => {
  initMap()
  connect()
})

onUnmounted(() => {
  disconnect()
  if (map.value) {
    map.value.remove()
  }
})

const centerOnAmbulance = (ambulance: AmbulanceLocation) => {
  if (map.value) {
    map.value.setView([ambulance.latitude, ambulance.longitude], 15)
    const marker = markers.value.get(ambulance.id)
    if (marker) {
      marker.openPopup()
    }
  }
}

const fitAllAmbulances = () => {
  if (!map.value) return

  const ambulanceList = getAmbulanceList()
  if (ambulanceList.length === 0) return

  const bounds = L.latLngBounds(
    ambulanceList.map((a) => [a.latitude, a.longitude] as [number, number]),
  )
  map.value.fitBounds(bounds, { padding: [50, 50] })
}
</script>

<template>
  <div class="relative h-full w-full">
    <!-- Map Container -->
    <div ref="mapContainer" class="h-full w-full z-0"></div>

    <!-- Connection Status -->
    <div class="absolute top-4 right-4 z-[1000]">
      <div
        :class="[
          'px-4 py-2 rounded-lg shadow-lg flex items-center gap-2',
          isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white',
        ]"
      >
        <span :class="['w-3 h-3 rounded-full', isConnected ? 'bg-green-200' : 'bg-red-200']"></span>
        {{ isConnected ? 'Connected' : 'Disconnected' }}
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="absolute top-16 right-4 z-[1000]">
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg shadow-lg">
        {{ error }}
      </div>
    </div>

    <!-- Ambulance List Panel -->
    <div
      class="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg max-w-xs max-h-96 overflow-hidden"
    >
      <div class="p-3 bg-indigo-600 text-white font-semibold flex justify-between items-center">
        <span>🚑 Ambulances ({{ getAmbulanceList().length }})</span>
        <button
          @click="fitAllAmbulances"
          class="text-xs bg-indigo-500 hover:bg-indigo-400 px-2 py-1 rounded"
        >
          View All
        </button>
      </div>
      <div class="overflow-y-auto max-h-72">
        <div v-if="getAmbulanceList().length === 0" class="p-4 text-center text-gray-500">
          No ambulances online
        </div>
        <div
          v-for="ambulance in getAmbulanceList()"
          :key="ambulance.id"
          @click="centerOnAmbulance(ambulance)"
          class="p-3 border-b hover:bg-gray-50 cursor-pointer transition"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium">{{ ambulance.plateNumber || ambulance.id }}</span>
            <span
              :class="[
                'px-2 py-1 text-xs rounded-full font-semibold',
                {
                  'bg-green-100 text-green-700': ambulance.status === 'available',
                  'bg-amber-100 text-amber-700': ambulance.status === 'en_route',
                  'bg-red-100 text-red-700': ambulance.status === 'busy',
                  'bg-gray-100 text-gray-700': ambulance.status === 'offline',
                },
              ]"
            >
              {{ ambulance.status }}
            </span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ ambulance.driver || 'No driver assigned' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Reconnect Button -->
    <div v-if="!isConnected" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
      <button
        @click="connect"
        class="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition"
      >
        Reconnect
      </button>
    </div>
  </div>
</template>

<style>
.custom-ambulance-marker {
  background: transparent;
  border: none;
}

/* Leaflet popup styling */
.leaflet-popup-content-wrapper {
  border-radius: 8px;
}

.leaflet-popup-content {
  margin: 0;
}
</style>
