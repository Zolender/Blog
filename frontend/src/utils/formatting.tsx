const AVATAR_COLORS = [
  'bg-teal-700', 'bg-violet-600', 'bg-amber-600',
  'bg-rose-600',  'bg-sky-600',   'bg-emerald-700',
]

export const getAvatarColor = (name: string = ''): string => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export const getReadTime = (content: string): string => {
  const words = content.trim().split(/\s+/).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

export const formatDate = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
): string => new Date(dateString).toLocaleDateString('en-US', options)

export const getPageNumbers = (current: number, total: number): (number | '...')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

export const stripMarkdown = (content: string): string =>
  content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`{1,3}[^`\n]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^-{3,}$/gm, '')
    .replace(/\n+/g, ' ')
    .trim()