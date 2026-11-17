/** Stable values are distinct from the saved legacy indices 0–3. */
export const WASH_ANSWER_VALUES = [10, 11, 12, 13, 14, 15] as const;
export type WashFrequency = 'daily' | 'everyOtherDay' | 'everyThirdDay' | 'everyFourFiveDays' | 'weekly' | 'lessWeekly' | 'severalWeekly';
const NEW_FREQUENCIES: WashFrequency[] = ['daily', 'everyOtherDay', 'everyThirdDay', 'everyFourFiveDays', 'weekly', 'lessWeekly'];
const LEGACY_OPTION_INDEX = [1, 2, 4, 5] as const;

export function washOptionIndex(value: number | undefined): number {
  if (value === undefined || !Number.isInteger(value)) return -1;
  if (value >= 10 && value <= 15) return value - 10;
  return LEGACY_OPTION_INDEX[value as 0 | 1 | 2 | 3] ?? -1;
}
export function resolveWashFrequency(value: number | undefined): WashFrequency {
  return NEW_FREQUENCIES[washOptionIndex(value)] ?? 'lessWeekly';
}
export function legacyWashFrequencyKey(value: number | undefined, fallback: WashFrequency): WashFrequency {
  return value !== undefined && value >= 0 && value <= 3
    ? (['daily', 'severalWeekly', 'weekly', 'lessWeekly'] as const)[value] ?? fallback
    : fallback;
}
export function washFrequencyAssumption(value: number | undefined): string | null {
  if (value === 0) return 'Your earlier answer grouped daily and every-other-day washing. This map uses every other day; update your wash answer if you wash daily.';
  if (value === 1) return 'Your earlier answer grouped 2–3 washes a week. This map uses every third day; update your wash answer if your rhythm is different.';
  if (value === 13) return 'For your 4–5-day rhythm, the map alternates four-day and five-day gaps.';
  if (value === 15 || value === 3) return 'Less than once a week covers a range. This map uses fourteen-day gaps as a starting point, rather than assuming your exact dates.';
  return null;
}
export const WASH_LABELS: Record<WashFrequency, string> = {
  daily: 'Every day', everyOtherDay: 'Every other day', everyThirdDay: 'Every 3rd day',
  everyFourFiveDays: 'Every 4–5 days', weekly: 'Once a week', lessWeekly: 'Less than once a week',
  severalWeekly: '2–3 times per week',
};
export function isScheduledWash(frequency: WashFrequency, offset: number): boolean {
  switch (frequency) {
    case 'daily': return true;
    case 'everyOtherDay': return offset % 2 === 0;
    case 'everyThirdDay': return offset % 3 === 0;
    case 'everyFourFiveDays': return offset % 9 === 0 || offset % 9 === 4;
    case 'weekly': return offset % 7 === 0;
    case 'lessWeekly': return offset % 14 === 0;
    // Kept for old typed integrations; new assessments never emit this cadence.
    case 'severalWeekly': return offset === 0 || Math.floor(offset * 3 / 7) > Math.floor((offset - 1) * 3 / 7);
  }
}
export function treatmentWashGap(frequency: WashFrequency): number {
  return { daily: 7, everyOtherDay: 4, everyThirdDay: 3, everyFourFiveDays: 2, severalWeekly: 3, weekly: 2, lessWeekly: 2 }[frequency];
}
export function scrubWashGap(frequency: WashFrequency): number {
  return frequency === 'weekly' || frequency === 'lessWeekly' ? 1 : treatmentWashGap(frequency);
}
export function washScheduleNote(frequency: WashFrequency): string {
  switch (frequency) {
    case 'daily': return 'You selected every day, so your map has a wash each day.';
    case 'everyOtherDay': return 'You selected every other day, so your map leaves one rest day between washes.';
    case 'everyThirdDay': return 'You selected every third day, so your map leaves two rest days between washes.';
    case 'everyFourFiveDays': return 'You selected every 4–5 days. Your map alternates four-day and five-day gaps, starting with Day 1.';
    case 'weekly': return 'You selected once a week, so your wash days are seven days apart.';
    case 'lessWeekly': return 'You selected less than once a week. Since that is a range, this map starts with fourteen-day gaps, not a claim about your exact dates. Judge treatments by completed washes.';
    case 'severalWeekly': return 'This older map uses three wash days a week. You can update your answer to choose an exact interval.';
  }
}
