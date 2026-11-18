import type { RoutineStep } from '../data/recommendations.ts';
import type { MapContext } from './routineMapTypes';
import type { FirstWashPlan } from './firstWash';

export { PROFESSIONAL_CARE_NOTE, PROFESSIONAL_CARE_DISCLAIMER } from './professionalCareCopy.ts';

/** Clinical advice takes priority; never carry intensive scalp/repair steps into interim care. */
export function getGentleInterimRoutine(routine: RoutineStep[]): RoutineStep[] {
  const gentleIds = ['dedeShampoo', 'oiShampoo', 'momoShampoo', 'curlShampoo', 'minuShampoo'];
  const existingCleanser = routine.find(s => gentleIds.includes(s.product.id));
  const conditioner = routine.find(s => s.product.category.toLowerCase().includes('conditioner') && !s.product.category.toLowerCase().includes('leave-in'));
  const cleanser = existingCleanser?.product;
  if (!cleanser) return []; // The protected endpoint must supply a safe cleanser; fail closed, never invent a product.
  const leaveIn = routine.find(s => s.product.id === 'oiMilk');
  return [
    {
      order: 1,
      product: { ...cleanser, reason: 'A regular cleansing option for gentle interim care—not a treatment for shedding or a scalp condition.' },
      timing: 'On a planned wash day, only if your scalp tolerates washing and your clinician has not advised otherwise',
      instruction: 'If your scalp is painful, broken or weeping, ask a clinician before following a new wash routine. Otherwise, wet your hair and scalp with comfortably warm water, use one gentle label-directed lather with your fingertips and rinse thoroughly. Do not scrub, exfoliate, or massage sore or broken skin.',
    },
    ...(conditioner ? [{
      ...conditioner, product: { ...conditioner.product, reason: 'Conditioning for easier detangling and less pulling on your lengths—not a remedy for hair loss.' },
      instruction: 'Apply to mid-lengths and ends, away from the scalp. Follow the label, detangle gently with slip and rinse well.',
    }] : []),
    ...(leaveIn ? [{
      ...leaveIn, product: { ...leaveIn.product, reason: 'Light conditioning for the lengths, not a scalp treatment or growth product.' },
      instruction: 'Use a small label-directed amount on damp mid-lengths and ends, away from irritated skin. Stop if it causes a reaction.',
    }] : []),
  ].map((step, index) => ({ ...step, order: index + 1 }));
}

export function getProfessionalCareContext(context: MapContext): MapContext {
  if (!context.hasSevereRedFlag) return context;
  return {
    ...context, routine: getGentleInterimRoutine(context.routine),
    focus: 'Gentle care while you seek professional advice',
    habit: context.habit.includes('clarifying') ? 'Avoid layering extra products on an uncomfortable scalp.' : context.habit,
    shouldShampooTwice: false,
  };
}

export function getGentleWashPlan(context: MapContext): FirstWashPlan {
  const routine = getGentleInterimRoutine(context.routine);
  return {
    steps: [
      ...routine.map((s, i) => ({
        title: `${i === 0 ? 'Cleanse gently with' : s.product.id === 'oiMilk' ? 'Soften damp lengths with' : 'Condition your lengths with'} ${s.product.name}`,
        detail: s.instruction,
      })),
      { title: 'Dry without pulling', detail: 'Blot rather than rub. Let your hair dry without tight styling or extra heat where practical. Keep styles comfortable and low-tension; loosen anything that pulls or hurts.' },
    ],
    layers: routine.map((s, i) => ({ title: `${i + 1}. ${s.product.name}`, detail: s.instruction })),
    keratin: null,
  };
}
