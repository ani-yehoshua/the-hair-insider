import type { MapDay, RoutineProgress } from '../../lib/routineMapTypes';

export type MapTab = 'today' | 'calendar' | 'shelf' | 'progress' | 'help';

export const DISCLAIMER =
  'Educational, quiz-based guidance—not a medical diagnosis or 1:1 consultation. Your purchase covers this routine and plan; physical products are sold separately.';

export interface CheckInSlot {
  key: string;
  kind: 'baseline' | 'wash' | 'phase' | 'summary';
  label: string;
  description: string;
}

/** Which check-ins belong to a given calendar day. Keys follow the stored contract. */
export function getCheckInSlots(day: MapDay): CheckInSlot[] {
  const slots: CheckInSlot[] = [];
  if (day.day === 1) {
    slots.push({ key: 'baseline', kind: 'baseline', label: 'Starting point', description: 'How things feel before the routine has had time to settle. Every later check compares to this.' });
  }
  if (day.washNumber !== null) {
    slots.push({ key: `wash-${day.day}`, kind: 'wash', label: `After wash ${day.washNumber}`, description: 'A quick note after this wash—how it felt in your hands.' });
  }
  if (day.day === 7 || day.day === 14 || day.day === 30) {
    slots.push({ key: `phase-${day.day}`, kind: 'phase', label: `End of phase ${day.phase}`, description: 'Close the phase with an honest read before the next one begins.' });
  }
  if (day.day === 30) {
    slots.push({ key: 'summary-30', kind: 'summary', label: 'Day 30 summary', description: 'Compared against your starting point, so you can decide what to keep.' });
  }
  return slots;
}

/** Timezone-safe formatting for YYYY-MM-DD strings. */
export function formatDate(date: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }): string {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return date;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, { ...opts, timeZone: 'UTC' });
}

export function hasAnyLogs(progress: RoutineProgress | null): boolean {
  if (!progress) return false;
  return progress.completedDays.length > 0 || Object.keys(progress.checkIns).length > 0;
}

export const KIND_LABEL: Record<MapDay['kind'], string> = {
  regular: 'Wash day',
  treatment: 'Treatment wash',
  rest: 'Rest day',
};
