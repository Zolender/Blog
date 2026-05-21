const AVATAR_COLORS = [
  'bg-teal-700', 'bg-violet-600', 'bg-amber-600',
  'bg-rose-600',  'bg-sky-600',   'bg-emerald-700',
]

export const getAvatarColor = (name: string): string => {
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