// ISO weeks in Melbourne. Week 53 deliberately extends the final feature.
export function featuredWeek(date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Melbourne', year: 'numeric', month: 'numeric', day: 'numeric',
  }).formatToParts(date).map(p => [p.type, p.value]));
  const day = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7));
  const start = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  return Math.min(52, Math.ceil(((day - start) / 86400000 + 1) / 7));
}
