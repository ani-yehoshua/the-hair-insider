import type { RoutineStep } from '../data/recommendations';
import type { WashInstruction } from './firstWash';

export type { WashFrequency } from './washFrequency';
import type { WashFrequency } from './washFrequency';
export type RoutineStyle = 'natural' | 'blowout' | 'straightened' | 'curled' | 'protective';
export interface MapContext {
  defaultProductIds?: string[];
  routine: RoutineStep[];
  answers: Record<string, number>;
  focus: string;
  observations: string[];
  habit: string;
  washFrequency: WashFrequency;
  stylePreference: RoutineStyle;
  shouldShampooTwice: boolean;
  reportedDensityChange: boolean;
  hasSevereRedFlag?: boolean;
}
export interface MapPhase {
  number: number;
  name: string;
  from: number;
  to: number;
  focus: string;
  milestone: string;
}
export interface MapDay {
  day: number;
  date: string;
  phase: number;
  kind: 'regular' | 'treatment' | 'rest';
  washNumber: number | null;
  title: string;
  note: string;
  steps: WashInstruction[];
  layers: WashInstruction[];
  treatmentName?: string;
  optionalAlternative?: WashInstruction;
}
/** All ratings have the same direction: 1 = struggling, 5 = comfortable/easier. */
export interface Ratings {
  scalp: number;
  lengths: number;
  tangling: number;
  breakage: number;
}
export interface CheckIn {
  day: number;
  kind: 'baseline' | 'wash' | 'phase' | 'summary';
  ratings: Ratings;
  note: string;
  irritated: boolean;
  recordedAt: string;
}
export interface RoutineProgress {
  version: 1;
  planKey: string;
  revision: number;
  firstName: string;
  startDate: string;
  completedDays: number[];
  checkIns: Record<string, CheckIn>;
}
export interface ProgressStore {
  mode: 'preview' | 'account';
  load: () => Promise<{ progress: RoutineProgress | null; firstName: string }>;
  save: (progress: RoutineProgress, expectedRevision: number) => Promise<RoutineProgress>;
}
export interface ProductGuidance {
  why: string;
  evidence: string;
  position: string;
  working: string;
  byWhen: string;
  ifNot: string;
  optional: boolean;
  general: boolean;
}
export const MAP_TITLE = 'Your 30-Day Length Retention Plan';
export const RATING_LABELS: Record<keyof Ratings, string> = {
  scalp: 'Scalp comfort',
  lengths: 'Softness & flexibility',
  tangling: 'Ease of detangling',
  breakage: 'Less visible breakage',
};
export const RATING_ENDPOINTS: Record<keyof Ratings, [string, string]> = {
  scalp: ['Uncomfortable', 'Comfortable'],
  lengths: ['Rough or stiff', 'Soft & flexible'],
  tangling: ['Very tangled', 'Easy to detangle'],
  breakage: ['Many snapped pieces', 'Few or none noticed'],
};
