import { getWashSchedule, type HairProfile, type ProductRecommendation, type RoutineStep } from '../data/recommendations';

function compactFrequency(timing: string): string {
  return timing
    .replace(/^Every wash day; (?:usually |about )?/, '')
    .replace(/^On wash day[,;]\s*(?:about )?/, '')
    .split(';')[0]
    .replace(/, after washing$/, '')
    .replace(' times weekly', '×/week')
    .replace('once weekly', 'once/week');
}

export function getRoutineSummary(washFrequency: HairProfile['washFrequency'], routine: RoutineStep[]): string {
  const schedule = getWashSchedule({ washFrequency });
  const steps = [
    `Cleanse ${compactFrequency(schedule.shampoo)}`,
    'Condition every wash',
    'Leave-in on damp lengths',
  ];
  if (routine.some(step => step.product.id === 'energizingSuperactive')) {
    steps.push(`Optional scalp serum ${compactFrequency(schedule.scalpSerum)}`);
  }
  return `Here’s your weekly routine in one glance: ${steps.join(' → ')}.`;
}

export function getFirstPurchaseReason(product: ProductRecommendation): string {
  if (product.id === 'nourishingHairBuildingPak') {
    return 'you reported a good response to protein, so one targeted treatment is a better place to start than layering several';
  }
  const category = product.category.toLowerCase();
  if (category.includes('heat protectant')) {
    return 'it helps limit heat damage during the styling you already do';
  }
  if (category.includes('conditioner')) {
    return 'it softens your lengths and makes gentle detangling easier';
  }
  if (category.includes('cleanse')) {
    return 'a gentle cleanse removes scalp oil and buildup before you condition or style';
  }
  if (category.includes('leave-in')) {
    return 'it helps keep damp lengths soft and easier to detangle before styling';
  }
  if (category.includes('mask')) {
    return 'it adds conditioning to fragile lengths without introducing several treatments at once';
  }
  return '';
}

export function getStarterPair(
  routine: RoutineStep[],
  first: ProductRecommendation | null,
  second: ProductRecommendation | null,
): RoutineStep[] {
  if (!first || !second || first.id === second.id) return [];
  const pair = [first, second].map(product => routine.find(step => step.product.id === product.id));
  return pair.every((step): step is RoutineStep => step !== undefined) ? pair : [];
}
