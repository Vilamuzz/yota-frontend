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

const parseDisplayDate = (dateString: string | null | undefined) => {
  if (!dateString) return null

  const value = String(dateString).trim()
  if (!value) return null

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDisplayDate = (
  dateString: string | null | undefined,
  options: Intl.DateTimeFormatOptions,
) => {
  const date = parseDisplayDate(dateString)
  if (!date) return '-'

  return date.toLocaleDateString('id-ID', {
    ...options,
    timeZone: 'Asia/Jakarta',
  })
}

export const formatDate = (dateString: string | null | undefined) => {
  return formatDisplayDate(dateString, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const formatMonth = (dateString: string | null | undefined) => {
  return formatDisplayDate(dateString, {
    month: 'long',
    year: 'numeric',
  })
}

export const formatBillingPeriodLabel = (
  period: number | string | null | undefined,
  fallbackDate?: string | null,
) => {
  if (period !== null && period !== undefined && period !== '') {
    const rawPeriod = String(period).trim()

    if (/^\d{6}$/.test(rawPeriod)) {
      const year = Number(rawPeriod.slice(0, 4))
      const month = Number(rawPeriod.slice(4, 6))
      const date = new Date(year, month - 1, 1)

      return `Bulan ${date.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
      })}`
    }

    if (/^\d{4}-\d{2}$/.test(rawPeriod)) {
      const [year, month] = rawPeriod.split('-').map(Number)
      const date = new Date(year, month - 1, 1)

      return `Bulan ${date.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
      })}`
    }

    return `Periode ${rawPeriod}`
  }

  if (fallbackDate) {
    return `Bulan ${formatMonth(fallbackDate)}`
  }

  return ''
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
