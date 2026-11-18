import type { RoutineStep } from '../data/recommendations';
import type { MapContext } from './routineMapTypes';
import { OPTIONAL_PRODUCT_IDS } from './routineCalendar';
import { orderShelf } from './shelfPersonalization';

const STRENGTH_MASKS = new Set(['nounouMask', 'nourishingHairBuildingPak']);
const MOISTURE_MASKS = new Set(['oiMask']);

export const START_HERE_NOTE = 'Start with these three when you’re ready to replace something. For everything else, keep using what you already have and swap in my picks as you run out. You don’t need to buy the whole shelf at once—you can still get a lot out of your plan with what’s already in your bathroom.';

/** Purchase priorities only. Never add a product, alter the wash order or respace treatments. */
export function getShelfGroups(context: MapContext) {
  const ordered = orderShelf(context.routine);
  const core = ordered.filter(s => !OPTIONAL_PRODUCT_IDS.has(s.product.id));
  const shampoo = core.find(s => /cleanse|shampoo/i.test(s.product.category));
  const conditioner = core.find(s => /conditioner/i.test(s.product.category) && !/leave-in/i.test(s.product.category));
  const strength = core.find(s => STRENGTH_MASKS.has(s.product.id));
  const moisture = core.find(s => MOISTURE_MASKS.has(s.product.id));
  // The routine has already applied the protein-vs-moisture recommendation logic.
  // If it contains both, sensitivity wins; otherwise use the starting focus.
  const proteinSensitive = context.answers.proteinResponse === 1 || context.answers.repairTreatmentResponse === 2;
  const strengthFirst = !proteinSensitive && (
    /strength|protein|elasticity|breakage|heat|chemical/i.test(context.focus) ||
    (!/moisture|dryness|porosity/i.test(context.focus) && context.answers.proteinResponse === 0)
  );
  const mask = strength && moisture ? (strengthFirst ? strength : moisture) : strength || moisture;
  // Professional-care plans deliberately have no mask. Keep their gentle leave-in,
  // rather than introduce an intensive treatment or make an optional item required.
  const fallback = core.find(s =>
    s !== shampoo && s !== conditioner && /leave-in|treatment|mask/i.test(s.product.category));
  const third = mask || fallback;
  const startHere = [shampoo, conditioner, third].filter((s): s is RoutineStep => !!s);
  const ids = new Set(startHere.map(s => s.product.id));
  return {
    startHere,
    addAsYouRunOut: ordered.filter(s => !ids.has(s.product.id)),
    fallbackNote: !mask && third
      ? 'Your plan doesn’t call for a protein or moisture mask. Your third starting pick is the care step already in your plan—there’s no extra treatment to buy.'
      : null,
  };
}

/** Reassurance beside named steps without treating unknown products as equivalent. */
export function getUseWhatYouOwnNotes(context: MapContext, instruction: string): string[] {
  return context.routine.filter(s => instruction.includes(s.product.name)).map(s => {
    const id = s.product.id, category = s.product.category.toLowerCase();
    if (id === 'nourishingHairBuildingPak' || id === 'nounouMask' || id === 'oiMask') {
      return 'No matching treatment from your shelf yet? Use your regular conditioner for now and skip this treatment. Don’t borrow this timing for a different protein or repair product—follow its own label, and don’t stack treatments.';
    }
    if (id === 'detoxScrub') return 'No exfoliating cleanser yet? Use your usual comfortable shampoo for now. Skip the scrub rather than adding another cleanser.';
    if (id === 'meluShield') return 'No heat protectant from your shelf yet? Use the one you have, following its heat-protection directions. If you don’t have one, skip the heat for now.';
    if (OPTIONAL_PRODUCT_IDS.has(id)) return 'This is optional. Keep using a suitable product or tool you already have, or leave this step out. Follow its own directions; you don’t need to buy this pick to follow your plan.';
    const role = /leave-in/.test(category) ? 'leave-in' : /conditioner/.test(category) ? 'conditioner' : /cleanse|shampoo/.test(category) ? 'shampoo' : null;
    if (!role) return '';
    return `No ${role} from your shelf yet? Use the one you have for now, if it already agrees with your hair and scalp. Follow its own label and use it in this role, not alongside a second one.${context.hasSevereRedFlag ? ' Keep to gentle care and let your professional’s advice come first.' : ''}`;
  }).filter(Boolean);
}
