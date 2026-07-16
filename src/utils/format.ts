export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatNumber = (amount: number) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })
}

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
export const formatMonth = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })
}

export const getCategoryLabel = (value: string, options: { value: string; label: string }[]) => {
  return options.find((c) => c.value === value)?.label || value
}

export const formatStatus = (status: string): string => {
  if (!status) return ''
  const statusMap: Record<string, string> = {
    draft: 'Draf',
    active: 'Aktif',
    completed: 'Selesai',
    expired: 'Kedaluwarsa',
    archived: 'Diarsipkan',
    pending: 'Tertunda',
    settlement: 'Berhasil',
    cancel: 'Dibatalkan',
    cancelled: 'Dibatalkan',
    published: 'Dipublikasi',
    rejected: 'Ditolak',
    accepted: 'Diterima',
    social_manager_accepted: 'Diterima Koordinator Sosial',
    available: 'Tersedia',
    inuse: 'Digunakan',
    maintenance: 'Pemeliharaan',
    paid: 'Dibayar',
    overdue: 'Terlambat',
    paused: 'Dijeda',
    inactive: 'Tidak Aktif',
    yatim: 'Yatim',
    piatu: 'Piatu',
    yatimPiatu: 'Yatim Piatu',
    ambulance_available: 'Tersedia',
    ambulance_unavailable: 'Tidak Tersedia',
    ambulance_in_use: 'Digunakan',
    in_service: 'Dalam Layanan',
    done: 'Selesai',
  }

  return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1)
}

export const formatDuration = (startString: string, endString: string): string => {
  const start = new Date(startString)
  const end = new Date(endString)
  const diffMs = end.getTime() - start.getTime()
  if (diffMs <= 0) return '0 menit'

  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) {
    return `${diffMins} menit`
  }

  const diffHours = Math.floor(diffMins / 60)
  const remainingMins = diffMins % 60
  if (remainingMins === 0) {
    return `${diffHours} jam`
  }
  return `${diffHours} jam ${remainingMins} menit`
}

