import type { MonthlyEvent, MonthlyEventType } from '../types';

const STORAGE_KEY = 'monthlyHistory.v1';

function monthKeyFromDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
}

function parseStore(): Record<string, MonthlyEvent[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, MonthlyEvent[]>;
  } catch (err) {
    console.error('Failed to parse monthly history store', err);
    return {};
  }
}

function saveStore(store: Record<string, MonthlyEvent[]>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Failed to save monthly history store', err);
  }
}

export function recordEvent(type: MonthlyEventType, payload: any, timestamp?: Date) {
  if (typeof window === 'undefined') return;
  const ts = timestamp ?? new Date();
  const key = monthKeyFromDate(ts);
  const store = parseStore();

  const ev: MonthlyEvent = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type,
    timestamp: ts.toISOString(),
    payload,
  };

  if (!store[key]) store[key] = [];
  store[key].push(ev);
  saveStore(store);
}

export function getMonthEvents(year: number, month: number) {
  if (typeof window === 'undefined') return [];
  const key = `${year}-${String(month).padStart(2, '0')}`;
  const store = parseStore();
  return store[key] || [];
}

export function getAllMonths() {
  if (typeof window === 'undefined') return [];
  const store = parseStore();
  return Object.keys(store)
    .sort()
    .reverse()
    .map((k) => {
      const [y, m] = k.split('-').map((s) => parseInt(s, 10));
      return { year: y, month: m, events: store[k] } as { year: number; month: number; events: MonthlyEvent[] };
    });
}

export function clearAllHistory() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export default { recordEvent, getMonthEvents, getAllMonths, clearAllHistory };
