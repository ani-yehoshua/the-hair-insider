/** Public teaser contract. Never add product identifiers, media, links or instructions. */
export interface RoutineTeaser {
  washCount: number;
  productCount: number;
  chosenProductCount: number;
  sharedProductCount: number;
  optionalProductCount: number;
  phases: { number: number; name: string; from: number; to: number }[];
  days: { day: number; phase: number; kind: 'regular' | 'treatment' | 'rest' }[];
  shelf: { category: string; reason: string; optional: boolean; answerChosen: boolean }[];
}
