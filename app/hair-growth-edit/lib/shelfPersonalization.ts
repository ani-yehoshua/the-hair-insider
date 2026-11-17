import type { RoutineStep } from '../data/recommendations';
import type { MapContext } from './routineMapTypes';
import { OPTIONAL_PRODUCT_IDS } from './routineCalendar.ts';

// Conservative counting: only a different pick or an answer-added item counts.
// Explaining a shared/default product in a person's context does not make it a
// uniquely chosen product. This does not change the routine itself.
const DEFAULT_PRODUCT_IDS = new Set<string>();

/** Selection explanations, not new recommendation or scheduling rules. */
export function getShelfPersonalization(step: RoutineStep, context: MapContext) {
  const a = context.answers, id = step.product.id;
  const optional = OPTIONAL_PRODUCT_IDS.has(id);
  const result = (reason: string, answerChosen = true) => ({
    reason, answerChosen: answerChosen && !(context.defaultProductIds ? new Set(context.defaultProductIds) : DEFAULT_PRODUCT_IDS).has(id), optional,
  });
  if (context.hasSevereRedFlag) return result(
    'Gentle care for your hair while you get professional advice—not a way to treat the cause of shedding or scalp changes.', false);
  switch (id) {
    case 'jolieFilteredShowerhead':
      return result('An optional water-setup extra, not something your quiz answers say you need.', false);
    case 'energizingSuperactive':
    case 'replumpingSuperactive':
      return result('Optional scalp care if you’d like it—not a requirement for growth or a fix for shedding.', false);
    case 'oiMilk':
      return result('A shared leave-in for everyday softness; your plan shows how to use it.', false);
    case 'dedeShampoo':
      return result(a.diameter === 0
        ? 'A lighter cleanse, because your fine strands can be weighed down by richer formulas.'
        : 'A lighter cleanse, because your answers point toward keeping the routine gentle and light.');
    case 'oiShampoo':
      return result(a.scalp === 0
        ? 'A gentle everyday cleanse, because your scalp feels comfortable and your answers don’t call for a more targeted option.'
        : 'A balanced everyday cleanse, without adding an intensive scalp step.');
    case 'rebalancingShampoo':
      return result(a.scalp === 1
        ? 'A lighter-feeling cleanse, because your roots get oily between washes.'
        : 'A cleansing option for the buildup pattern your answers pointed to.');
    case 'energizingShampoo':
      return result('A lighter cleanse around the shedding you reported—not a treatment for its cause.');
    case 'momoShampoo':
      return result(a.diameter === 2
        ? 'A richer cleanse, because your coarser strands can benefit from a little more softness.'
        : 'A moisture-focused cleanse for the dry-feeling lengths your answers pointed to.');
    case 'curlShampoo':
      return result('A softening cleanse, because you told us your natural hair forms curls or coils.');
    case 'minuShampoo':
    case 'minuConditioner':
      return result('Color-conscious care, because you told us your hair has been colored.');
    case 'curlConditioner':
      return result('Conditioning with slip, because your natural curls or coils need gentle detangling.');
    case 'dedeConditioner':
      return result('Lightweight conditioning, because your strands feel fine and richer formulas may weigh them down.');
    case 'momoConditioner':
      return result(a.diameter === 2
        ? 'Richer conditioning for the coarser strands you described.'
        : 'A little more softness for the moisture needs your answers pointed to.');
    case 'oiConditioner':
      return result(a.diameter === 3
        ? 'Balanced conditioning to start simply while your strand size is still uncertain.'
        : 'Balanced conditioning, because your answers don’t call for a lighter or richer formula.');
    case 'heartConditioner':
      return result('Conditioning for lightened lengths, because you told us your hair has been bleached or highlighted.');
    case 'silverShampoo':
      return result('An optional color-care pick, because you want to soften unwanted yellow tones.');
    case 'heartShampoo':
      return result('An optional color-care pick, because you want to soften unwanted orange or brassy tones.');
    case 'nourishingHairBuildingPak':
      return result('Richer repair care, because you’ve liked protein treatments and richer masks without a heavy or stiff finish.');
    case 'nounouMask':
      return result(a.proteinResponse === 0
        ? 'A lighter repair starting point, because your hair has felt better after strength care.'
        : 'A lighter repair starting point for the fragile lengths your answers pointed to.');
    case 'oiMask':
      if (a.proteinResponse === 1 || a.repairTreatmentResponse === 2) return result('Softening care, because repair treatments have left your lengths hard or rough.');
      if (/moisture|dryness|high-porosity/.test(context.focus)) return result('Extra softening care for the dryness or flexibility needs your answers pointed to.');
      return result('A general softening option to have in your plan—not an extra need your answers confirmed.', false);
    case 'detoxScrub':
      return result('A separate cleansing option, because your answers point to buildup rather than a need for more layers.');
    case 'meluShield':
      return result('Protection for the heat styling or heat-related wear reflected in your answers.');
    case 'bioIonicDryer':
      return result('An optional dryer to consider, because a blowout is the style you usually wear.');
    case 'bioIonicFlatIron':
      return result('An optional tool to consider, because you usually wear your hair straightened.');
    case 'bioIonicCurlingIron':
      return result('An optional tool to consider, because you usually finish your hair with curls or waves.');
    case 'moroccanoilLight':
      return result(a.diameter === 0
        ? 'An optional lighter finish for your fine strands, without a heavy layer.'
        : 'An optional lighter finish for the lightened hair you described.');
    case 'oiOil':
      return result('An optional finishing choice matched to your strand and color answers—not another product you have to buy.');
    case 'curlMousse':
      return result('An optional styling pick for the natural waves you usually wear.');
    case 'curlSerum':
      return result('An optional styling pick for the natural curls or coils you usually wear.');
    case 'volumeMousse':
      return result('An optional airy styling pick, because your fine strands can fall flat under richer products.');
    case 'loveSmoothing':
      return result('An optional smoothing pick for your coarser strands and the finish you wear.');
    case 'blowdryPrimer':
      return result(context.stylePreference === 'blowout'
        ? 'An optional styling pick, because a blowout is your usual finish.'
        : 'A general styling option if you want it—not a product your answers say you must add.', context.stylePreference === 'blowout' || context.stylePreference === 'straightened' || context.stylePreference === 'curled');
    default:
      return result('A general care option to consider—not a need the quiz can confirm.', false);
  }
}

export function orderShelf(steps: RoutineStep[]) {
  // Presentation only: do not change step.order, timing, products or the calendar.
  return [
    ...steps.filter(s => !OPTIONAL_PRODUCT_IDS.has(s.product.id)),
    ...steps.filter(s => OPTIONAL_PRODUCT_IDS.has(s.product.id)),
  ];
}
