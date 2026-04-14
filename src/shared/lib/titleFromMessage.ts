export function titleFromFirstMessage(text: string, maxLen = 48): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (!t) return 'Новый чат'
  return t.length <= maxLen ? t : `${t.slice(0, maxLen - 1)}…`
}
