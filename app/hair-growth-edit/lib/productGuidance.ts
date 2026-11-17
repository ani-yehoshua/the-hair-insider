import type { RoutineStep } from '../data/recommendations';
import { QUESTIONS, getSelectedOption } from '../data/questions.ts';
import { OPTIONAL_PRODUCT_IDS } from './routineCalendar.ts';
import type { MapContext, ProductGuidance } from './routineMapTypes';
import { getShelfPersonalization } from './shelfPersonalization.ts';

function answer(context: MapContext, id: string): string {
  const question = QUESTIONS.find(q => q.id === id);
  return question ? getSelectedOption(question, context.answers[id])?.label || 'not specified' : 'not specified';
}
function getProductGuidanceDetails(step: RoutineStep, context: MapContext): ProductGuidance {
  const id = step.product.id, category = step.product.category.toLowerCase();
  const general = ['jolieFilteredShowerhead', 'energizingSuperactive', 'oiMilk'].includes(id);
  const base: ProductGuidance = {
    why: step.product.reason, evidence: `Your starting focus: ${context.focus}.`,
    position: 'Follow the matching step on your calendar, not every product on every wash.',
    working: 'Your hair feels comfortable and the product does its intended job without new coating or irritation.',
    byWhen: 'Check after your next few uses; response varies and results are not guaranteed.',
    ifNot: 'Change one thing at a time. Use less if hair feels coated; stop the suspected product for new burning, rash or worsening irritation.',
    optional: OPTIONAL_PRODUCT_IDS.has(id), general,
  };
  if (context.hasSevereRedFlag) return { ...base,
    general: true, why: step.product.reason,
    evidence: `Your answers call for professional assessment. This is conservative interim care, not a product selected to treat the cause. Your selected wash frequency: “${answer(context, 'shampooFrequency')}”.`,
    position: category.includes('cleanse') ? 'First: one gentle cleanse, only if tolerated and consistent with professional advice.'
      : id === 'oiMilk' ? 'After rinsing: a small amount on damp mid-lengths and ends, away from irritated skin.'
        : 'After cleansing: condition mid-lengths and ends, not the scalp, then rinse.',
    working: 'For cleansing: comfortable rinsing. For the lengths: easier detangling with less pulling. Neither means the cause of shedding or a scalp concern is being treated.',
    byWhen: 'Check tolerability each use and comfort after your next wash. Do not wait for a calendar milestone to seek professional care.',
    ifNot: 'Stop a suspected irritant. Do not add scalp treatments, exfoliants or stronger repair products to solve the concern. Follow professional advice; seek prompt help for worsening symptoms.',
  };
  if (id === 'jolieFilteredShowerhead') return { ...base,
    why: 'Water is part of every wash, but a filter is an optional setup choice—not a requirement for your map.',
    evidence: 'General guidance: the quiz did not test your water. A standard shower filter does not soften hard water or treat hair loss.',
    position: 'Optional water setup, outside your product-layering order.',
    working: 'Check the filter’s stated contaminant removal, certification and replacement instructions—not a hair-growth claim.',
    byWhen: 'Before deciding to buy; inspect and replace on the manufacturer’s schedule if you use one.',
    ifNot: 'Skip this purchase if it does not remove the contaminant you care about. Your routine can still be followed without a filter.',
  };
  if (id === 'energizingSuperactive') return { ...base,
    why: 'An optional shared scalp-care recommendation. You do not need a serum for hair to grow.',
    evidence: context.reportedDensityChange ? 'You reported a density change. This cannot identify or treat its cause; professional assessment matters more than adding a serum.' : 'General scalp-care option—not evidence that your answers show thinning or a need for a growth treatment.',
    position: 'Optional: directly on a clean scalp, separate from products on the lengths. Only on the scheduled days.',
    working: 'Your scalp tolerates it without new burning, itching or redness. Tolerability is not proof of hair regrowth.',
    byWhen: 'Check comfort after each use. Thirty days is not a reliable regrowth test; follow the label and professional advice.',
    ifNot: 'Stop and rinse as directed for irritation; do not push through burning. Seek professional guidance for persistent symptoms or concerning shedding.',
  };
  if (category.includes('cleanse') || category.includes('shampoo')) return { ...base,
    evidence: `You selected “${answer(context, 'scalp')}” for your scalp and “${answer(context, 'shampooFrequency')}” for wash frequency.`,
    position: category.includes('toning') ? 'Optional replacement for your regular shampoo on a separate toning wash; never an extra cleanser.' : 'The cleansing step, before rinse-out conditioner or the scheduled treatment.',
    working: 'Roots feel clean after rinsing, without new tightness or irritation. Optional toning shampoo should reduce unwanted warmth without drying or over-toning.',
    byWhen: 'After 1–3 washes for cleansing comfort; assess color only after each optional toning use.',
    ifNot: 'Rinse thoroughly and review the amount and frequency. Do not automatically scrub harder or add another cleanser. Pause toning if dry, rough or over-toned; stop a suspected irritant.',
  };
  if (category.includes('leave-in')) return { ...base,
    why: id === 'oiMilk' ? 'This is the shared leave-in option used in the map. Your answers shape application and styling; its inclusion is not a unique diagnosis of your hair.' : base.why,
    evidence: `You selected “${answer(context, 'pattern')}” and “${answer(context, 'usualStyle')}”. Keep it on the lengths, not the scalp.`,
    position: 'After rinsing and gentle water removal; before styling or heat protection. It stays in.',
    working: 'Damp hair is easier to detangle and dry lengths feel softer, not sticky, flat or coated.',
    byWhen: 'Compare after 1–3 washes, once hair is dry.',
    ifNot: 'Use less on the next wash if coated or heavy. If still rough, check rinse-out conditioning and even application before increasing oil or adding a second leave-in.',
  };
  if (category.includes('conditioner')) return { ...base,
    evidence: `You selected “${answer(context, 'diameter')}” strands and “${answer(context, 'chemical')}” for color/services.`,
    position: 'After cleansing, on mid-lengths and ends. NOUNOU and OI masks replace this on their treatment washes; Hair Building Pak is followed by conditioner.',
    working: 'Tangles release with less pulling and lengths feel flexible after rinsing and drying.',
    byWhen: 'Notice slip during the first wash; compare softness over 2–3 washes.',
    ifNot: 'Distribute through sections and follow the label’s leave time. Keep it away from roots if heavy; if flexibility worsens, pause the suspected product rather than adding more treatment.',
  };
  if (['nounouMask', 'oiMask', 'nourishingHairBuildingPak', 'detoxScrub'].includes(id)) return { ...base,
    evidence: `Your starting focus is ${context.focus}. You selected “${answer(context, 'proteinResponse')}” for your response to protein/repair care.`,
    position: id === 'detoxScrub' ? 'On its scheduled wash only, INSTEAD OF regular shampoo; no mask or toning shampoo on that wash.'
      : id === 'nourishingHairBuildingPak' ? 'After shampoo and before conditioner, with the skipped-wash spacing shown on your calendar.'
        : 'After cleansing, INSTEAD OF regular conditioner on the scheduled mask wash.',
    working: id === 'detoxScrub' ? 'Less persistent coating after rinsing, without soreness or a stripped feeling.' : 'Lengths feel easier to detangle and flexible after drying—not harder, rougher or increasingly brittle.',
    byWhen: 'Check after the first scheduled use and compare over the next 1–2 scheduled uses. Do not add extra treatment washes to speed this up.',
    ifNot: id === 'detoxScrub' ? 'Pause if the scalp is sore or irritated. Return to a gentle regular wash; do not add a second cleanser.'
      : 'Pause this treatment if stiffness, roughness or breakage worsens. Use regular conditioner on the next wash, avoid another repair treatment, and seek guidance if the change persists.',
  };
  if (id === 'meluShield') return { ...base,
    evidence: `Your usual style: “${answer(context, 'usualStyle')}”. Your heat use: “${answer(context, 'heatUse')}”.`,
    position: 'Before every dryer or hot-tool session, following wet/dry application directions. Skip only when fully air-drying.',
    working: 'Product spreads without coating or irritation. Heat damage prevention cannot be verified by one wash or how silky a style feels.',
    byWhen: 'Check application and tolerability every heat session; review handling over the month.',
    ifNot: 'Reduce heat and repeated passes rather than relying on more protectant. Stop a suspected irritant and do not use hot tools on wet hair.',
  };
  if (category.includes('tool')) return { ...base,
    evidence: `You selected “${answer(context, 'usualStyle')}”; this is an option for that style, not a required purchase.`,
    position: 'Optional styling tool, after protection. Irons only on fully dry hair; finishing oil afterward.',
    working: 'You can achieve the style with gentle tension, fewer repeated passes and the lowest effective temperature.',
    byWhen: 'Assess handling at each styling session, not as evidence of faster hair growth.',
    ifNot: 'Use less heat, fewer passes or a heat-free style. A painful or damaging technique is not something to persist with for 30 days.',
  };
  if (category.includes('oil')) return { ...base,
    evidence: `Your strand size: “${answer(context, 'diameter')}”. Use the smallest useful amount.`,
    position: 'Optional final step on dry ends, after hot tools—not a heat protectant.',
    working: 'Ends feel smoother without heaviness, stringiness or a greasy coating.',
    byWhen: 'Once hair is dry after each use.',
    ifNot: 'Use less or omit it. Rough ends still need conditioning and gentle handling; extra oil does not repair split ends.',
  };
  return { ...base,
    evidence: `You selected “${answer(context, 'pattern')}” and “${answer(context, 'usualStyle')}”.`,
    position: 'Optional styling step after leave-in; finishing oil goes last, after heat tools.',
    working: 'The style is easier to create or hold without sticky, heavy or flaky buildup.',
    byWhen: 'After 1–3 styling sessions, once hair is dry.',
    ifNot: 'Use less or leave this extra out. Keep one styling product at a time rather than adding another with the same job.',
  };
}

export function getProductGuidance(step: RoutineStep, context: MapContext): ProductGuidance {
  const guidance = getProductGuidanceDetails(step, context);
  if (context.hasSevereRedFlag) return guidance;
  const pick = getShelfPersonalization(step, context);
  return { ...guidance, why: pick.reason, evidence: pick.reason, general: !pick.answerChosen };
}
