export const formatPhoneWithDashes = (phone: string): string => {
  if (!phone) return ''
  let cleaned = phone.replace(/\D/g, '')

  if (cleaned.startsWith('62')) {
    cleaned = cleaned.substring(2)
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }

  const match = cleaned.match(/^(\d{3})(\d{4})(\d{3,5})$/)
  if (match) {
    return `+62 ${match[1]}-${match[2]}-${match[3]}`
  }

  return `+62 ${cleaned}`
}
