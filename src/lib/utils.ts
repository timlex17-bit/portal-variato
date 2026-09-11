export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-TL', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatCurrency(amount: number) {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2 })
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function statusBadgeClass(status: string) {
  const map: Record<string, string> = {
    ativu: 'badge-ativu', pendente: 'badge-pendente',
    rezolvidu: 'badge-rezolvidu', kansela: 'badge-kansela',
    pagu: 'badge-pagu', draft: 'badge-draft',
  }
  return 'badge ' + (map[status] || 'badge-pendente')
}

export function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Agora'
  if (mins < 60) return `${mins} minutu liu ba`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} oras liu ba`
  const days = Math.floor(hrs / 24)
  return `${days} loron liu ba`
}
