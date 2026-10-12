export const getLocalDateString = (d: Date = new Date()): string => {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(d);
    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const day = parts.find((p) => p.type === 'day')?.value;
    if (y && m && day) return `${y}-${m}-${day}`;
  } catch {
    // Fallback to local time
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getIstHourAndDateStr = (
  d: Date = new Date()
): { hour: number; dateStr: string } => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hour12: false,
    }).formatToParts(d);
    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const day = parts.find((p) => p.type === 'day')?.value;
    const hr = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    if (y && m && day) {
      return { hour: hr === 24 ? 0 : hr, dateStr: `${y}-${m}-${day}` };
    }
  } catch {
    // Fallback
  }
  return { hour: d.getHours(), dateStr: getLocalDateString(d) };
};

export const parseDateTime = (ts: any): Date | null => {
  if (!ts) return null;
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts.seconds !== undefined) return new Date(ts.seconds * 1000);
  if (ts._seconds !== undefined) return new Date(ts._seconds * 1000);
  // Handle pending Firestore serverTimestamp() sentinel object
  if (
    typeof ts === 'object' &&
    typeof ts._methodName === 'string' &&
    ts._methodName.toLowerCase().includes('servertimestamp')
  ) {
    return new Date();
  }
  if (ts instanceof Date) return ts;
  if (typeof ts === 'string' || typeof ts === 'number') {
    if (typeof ts === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(ts.trim())) {
      const [y, m, d] = ts.trim().split('-').map(Number);
      return new Date(y, m - 1, d, 12, 0, 0);
    }
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

export const isCompletedOnDate = (
  lastCompletedAt: any,
  targetDateStr: string = getLocalDateString(),
  lastCompletedDate?: string
): boolean => {
  if (lastCompletedDate && lastCompletedDate.trim() === targetDateStr) {
    return true;
  }
  if (typeof lastCompletedAt === 'string' && lastCompletedAt.trim() === targetDateStr) {
    return true;
  }
  const dt = parseDateTime(lastCompletedAt);
  if (!dt) return false;
  return getLocalDateString(dt) === targetDateStr;
};

export const getSecondsUntilMidnightIST = (): number => {
  const now = new Date();
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    }).formatToParts(now);

    const h = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10) % 24;
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    const s = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);
    const elapsedSecondsToday = h * 3600 + m * 60 + s;
    return Math.max(0, 86400 - elapsedSecondsToday);
  } catch {
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return Math.max(0, Math.floor((endOfDay.getTime() - now.getTime()) / 1000));
  }
};
