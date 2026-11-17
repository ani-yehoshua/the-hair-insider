import { getFirstWashPlan } from './mapFirstWash.ts';
import { getKeratinSchedule } from './washTiming';
import type { MapContext, MapDay, MapPhase } from './routineMapTypes';
import { getGentleWashPlan, getProfessionalCareContext } from './professionalCareClient';
import { isScheduledWash, legacyWashFrequencyKey, treatmentWashGap, scrubWashGap } from './washFrequency.ts';

export function localDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function addDays(date: string, count: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + count);
  return d.toISOString().slice(0, 10);
}
export function getPlanKey(context: MapContext): string {
  // Stable per assessment, independent of date/name. Old assessments keep their logs.
  const input = JSON.stringify([
    Object.entries(context.answers).sort(([a], [b]) => a.localeCompare(b)),
    context.routine.map(s => s.product.id), legacyWashFrequencyKey(context.answers.shampooFrequency, context.washFrequency), context.stylePreference,
  ]);
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) hash = Math.imul(hash ^ input.charCodeAt(i), 16777619) >>> 0;
  return `map1-${hash.toString(16).padStart(8, '0')}`;
}

function focusMessages(context: MapContext): [string, string, string] {
  if (context.hasSevereRedFlag) return [
    'Arrange professional assessment now; do not wait for a milestone. Notice only comfort, tangling and how your lengths feel after gentle care—not changes in shedding as proof a product works.',
    'Compare comfort and ease of detangling with Day 1. Follow professional advice even when it differs from this calendar; ongoing symptoms are not a reason to add a scalp treatment.',
    'Review comfort, handling and your notes. This month cannot establish the cause of shedding or prove regrowth. Continue professional follow-up regardless of how your lengths feel.',
  ];
  const f = context.focus.toLowerCase();
  if (/buildup|low.porosity/.test(f)) return [
    'Notice how clean your roots feel and whether your lengths still feel coated once dry. Start with less leave-in, not extra layers.',
    'Compare coating and ease of rinsing with Day 1. Less heaviness is useful feedback; dryness is not a sign to cleanse harder.',
    'Look for roots that feel clean without new irritation and lengths that feel less coated. If residue keeps returning, review product amounts before adding a cleanser.',
  ];
  if (/scalp|shedding/.test(f)) return [
    'Watch scalp comfort after washing, not a growth deadline. Your answers cannot establish the cause of shedding or a scalp change.',
    'Compare comfort and irritation with Day 1. Persistent, increasing, sudden or patchy shedding needs professional assessment, not a stronger serum.',
    'Review comfort and your notes with a professional if shedding or irritation continues. Thirty days cannot establish regrowth or explain hair loss.',
  ];
  if (/strength|elasticity|breakage|heat|chemical/.test(f)) return [
    'Notice flexibility and how gently you can detangle. Less snapping during handling matters more than a dramatic change in length.',
    'Compare snapped pieces and flexibility with your baseline. A treatment should not leave hair progressively harder or more brittle.',
    'Look for easier handling and fewer snapped pieces—not proof of faster growth. If breakage is unchanged, review heat, tension and detangling before adding repair products.',
  ];
  if (/tension|mechanical/.test(f)) return [
    'Notice whether your usual style pulls at the scalp. Loosen painful styles now; do not wait for the next phase.',
    'Compare comfort around your hairline and breakage during detangling. Keep the tension change consistent before judging a product.',
    'Compare comfort and snapped pieces with Day 1. Products cannot compensate for repeated pulling; persistent pain or thinning needs professional guidance.',
  ];
  if (/moisture|dryness|porosity/.test(f)) return [
    'Notice softness and detangling after your first wash. Flexible lengths—not an oily coating—are the useful starting signal.',
    'Compare tangles, roughness and flexibility with Day 1. Check conditioner coverage and damp-hair leave-in before adding more oil.',
    'Look for easier detangling and lengths that stay comfortable between washes. If roughness persists, review application and possible damage rather than repeatedly buying richer products.',
  ];
  return [
    'Notice scalp comfort and how your lengths feel dry. Your starting focus is protecting what is already working, not fixing an assumed deficiency.',
    'Compare handling and comfort with Day 1. Consistency without new stiffness, coating or irritation is useful progress.',
    'Review softness, detangling and visible breakage. Keeping hair comfortable and avoiding unnecessary steps is a worthwhile result; new length is not a 30-day promise.',
  ];
}
export function getMapPhases(context: MapContext): MapPhase[] {
  const milestones = focusMessages(context);
  const sparse = context.washFrequency === 'lessWeekly'
    ? ' You may only have one wash in this phase; judge this after the wash, not because seven days have passed.'
    : '';
  const styleFocus = context.stylePreference === 'protective'
    ? 'Keep protective styles comfortable and low-tension.'
    : context.stylePreference === 'natural'
      ? 'Keep your natural styling simple while you learn how the routine feels.'
      : 'Keep heat at the lowest effective setting and protect the lengths every time.';
  return [
    { number: 1, name: 'Set your foundation', from: 1, to: 7,
      focus: `Learn your wash order and make one habit change: ${context.habit} ${styleFocus}`,
      milestone: milestones[0] + sparse },
    { number: 2, name: 'Read your hair', from: 8, to: 14,
      focus: 'Follow the treatment spacing in your calendar. Compare one wash at a time before changing amounts or adding a product.',
      milestone: milestones[1] + sparse },
    { number: 3, name: 'Make it yours', from: 15, to: 30,
      focus: `Keep the steps that agree with your ${context.stylePreference === 'natural' ? 'natural styling' : context.stylePreference + ' styling'} routine. Adjust amounts before swapping products; pause anything that causes a reaction.`,
      milestone: milestones[2] },
  ].map(phase => context.hasSevereRedFlag ? {
    ...phase,
    focus: phase.number === 1 ? 'Put professional advice first. Keep comfortable cleansing, conditioning and gentle handling simple.'
      : phase.number === 2 ? 'Keep to gentle interim care only if tolerated. Review comfort and detangling, not a treatment response for shedding.'
        : 'Keep what feels comfortable and follow your clinician’s plan. There is no need to finish this calendar before changing care on professional advice.',
  } : phase);
}

const MASKS = ['nounouMask', 'oiMask', 'nourishingHairBuildingPak'];
export const OPTIONAL_PRODUCT_IDS = new Set([
  'jolieFilteredShowerhead', 'energizingSuperactive', 'replumpingSuperactive',
  'bioIonicDryer', 'bioIonicFlatIron', 'bioIonicCurlingIron',
  'volumeMousse', 'blowdryPrimer', 'loveSmoothing', 'curlSerum', 'curlMousse',
  'oiOil', 'moroccanoilLight', 'heartShampoo', 'silverShampoo',
]);
export function buildRoutineCalendar(context: MapContext, startDate: string): MapDay[] {
  context = getProfessionalCareContext(context);
  const { routine, washFrequency } = context;
  const mask = routine.find(s => MASKS.includes(s.product.id));
  const scrub = routine.find(s => s.product.id === 'detoxScrub');
  const shampoo = routine.find(s => s.product.category.toLowerCase().includes('cleanse'));
  const conditioner = routine.find(s => s.product.category.toLowerCase().includes('conditioner') && !s.product.category.toLowerCase().includes('leave-in'));
  const toner = routine.find(s => s.product.category === 'Optional toning shampoo');
  const tool = routine.find(s => ['bioIonicDryer', 'bioIonicFlatIron', 'bioIonicCurlingIron'].includes(s.product.id));
  const maskGap = mask?.product.id === 'nourishingHairBuildingPak'
    ? getKeratinSchedule(washFrequency).skipWashes + 1
    : treatmentWashGap(washFrequency);
  const scrubGap = scrubWashGap(washFrequency);
  const phases = getMapPhases(context);
  let washNumber = 0;
  let lastScrubWash = 0;
  let lastScrubOffset = -7;
  return Array.from({ length: 30 }, (_, i): MapDay => {
    const day = i + 1;
    const isWash = isScheduledWash(washFrequency, i);
    const phase = phases.find(p => day >= p.from && day <= p.to)!;
    const date = addDays(startDate, i);
    if (!isWash) return {
      day, date, phase: phase.number, kind: 'rest', washNumber: null, title: 'A little space between washes',
      note: 'No extra wash or treatment is due. Rest days still count: look after your lengths without adding another layer.',
      steps: [
        { title: 'Keep handling gentle', detail: context.stylePreference === 'protective' ? 'Check that your style is not pulling at your scalp or hairline. Loosen a painful or tight style; comfort comes before keeping a style in place.' : 'Avoid unnecessary brushing or pulling. If you need to detangle, work gently from the ends upward with slip rather than forcing through knots.' },
        { title: 'Leave room to notice', detail: 'Keep the product order from your last wash. You do not need to reapply every product between washes. Note new irritation or stiffness instead of covering it with another layer.' },
      ], layers: [],
    };
    washNumber++;
    const n = washNumber;
    const maskToday = !!mask && (mask.product.id === 'oiMask' ? n % maskGap === 0 : (n - 1) % maskGap === 0);
    const scrubToday = !!scrub && n > 1 && !maskToday &&
      (lastScrubWash === 0 || n - lastScrubWash >= scrubGap) && i - lastScrubOffset >= 7;
    if (scrubToday) { lastScrubWash = n; lastScrubOffset = i; }
    // Optional serum remains capped at three applications in any seven days.
    const serumToday = washFrequency === 'daily' ? [0, 3, 5].includes(i % 7)
      : washFrequency === 'everyOtherDay' ? n % 4 !== 0 : true;
    const dayRoutine = routine.filter(s => {
      if (MASKS.includes(s.product.id)) return maskToday;
      if (s.product.id === 'detoxScrub') return scrubToday;
      if (s.product.category === 'Optional toning shampoo') return false;
      if (s.product.id === 'energizingSuperactive') return serumToday;
      return true;
    });
    const plan = context.hasSevereRedFlag ? getGentleWashPlan(context)
      : getFirstWashPlan(dayRoutine, washFrequency, context.shouldShampooTwice, context.stylePreference, false);
    let steps = plan.steps.map(s => ({ ...s }));
    let layers = plan.layers.map(s => ({ ...s }));
    const heat = routine.find(s => s.product.id === 'meluShield');
    if (context.stylePreference === 'natural' && heat) {
      const beforeStyling = steps.findIndex(s => s.title.startsWith('Style with'));
      steps.splice(beforeStyling < 0 ? steps.length - 1 : beforeStyling, 0, {
        title: `If using a dryer or diffuser — apply ${heat.product.name}`,
        detail: 'You can skip this when fully air-drying. If you diffuse or blow-dry, use heat protection according to its wet/dry directions before the heat begins. Use the lowest effective setting and keep the dryer moving.',
      });
    }
    if (scrubToday && scrub && shampoo) {
      steps = steps.map(s => s.title.includes(shampoo.product.name) ? {
        title: `Cleanse with ${scrub.product.name}`,
        detail: `${scrub.instruction} Follow the current label for amount, application and rinse time. It replaces ${shampoo.product.name} today; do not use both. Do not add your mask or optional toning shampoo today. Stop if the scalp feels sore or irritated.`,
      } : s);
      layers = layers.map(s => ({ ...s, detail: s.detail.replaceAll(shampoo.product.name, scrub.product.name) }));
    }
    // The first-wash helper deliberately starts OI users on conditioner. On an
    // actual OI treatment wash, replace that branch rather than adding both.
    if (maskToday && mask?.product.id === 'oiMask' && conditioner) {
      steps = steps.map(s => s.title.includes(conditioner.product.name) ? {
        title: `Treat your lengths with ${mask.product.name}`,
        detail: `${mask.instruction} Apply through mid-lengths and ends, not the scalp; detangle gently with slip. Use it instead of ${conditioner.product.name} today, not as an extra layer. Return to regular conditioner on the next regular wash.`,
      } : s);
      layers = layers.map(s => ({ ...s, detail: s.detail.replaceAll(conditioner.product.name, mask.product.name).replace(/On its scheduled treatment wash,[^.]+\./g, '') }));
    }
    steps = steps.map(s => {
      const optional = routine.some(p => OPTIONAL_PRODUCT_IDS.has(p.product.id) && s.title.includes(p.product.name));
      const result = { ...s, title: s.title.replace('First use:', n === 1 ? 'First use:' : 'Scheduled treatment:') };
      if (optional) {
        result.title = `Optional — ${result.title}`;
        result.detail = `Only if you choose to use this step; skipping it does not stop you following your map. ${result.detail}`;
      }
      if (/then finish/.test(result.title)) {
        result.detail += `${routine.some(p => ['oiOil', 'moroccanoilLight'].includes(p.product.id)) ? ' Finishing oil is optional—leave it out if your ends do not need it.' : ''}${tool ? ` Your recommended tool, ${tool.product.name}, is optional; use it only for the style you already wear. ${tool.instruction}` : ''}`;
      }
      return result;
    });
    const treatment = maskToday ? mask : scrubToday ? scrub : undefined;
    const treatmentNote = maskToday && mask?.product.id === 'nourishingHairBuildingPak'
      ? `Use your selected protein treatment today only if you have actually completed ${maskGap - 1} washes without this protein treatment since its last use (or this is your first use), then skip the next ${maskGap - 1} washes. If you missed a wash, use ${conditioner?.product.name || 'your regular conditioner'} instead and wait until that spacing is met; a calendar date does not override the wash count. ${getKeratinSchedule(washFrequency).explanation} A quiz cannot confirm protein need; follow the current label and do not repeat a treatment that makes your hair or scalp feel worse.`
      : treatment ? 'One scheduled treatment today, not multiple treatments stacked together.'
        : 'Your regular cleanser, conditioner and leave-in form the foundation today. No extra repair mask is due.';
    const optionalAlternative = toner && !treatment && n > 1 ? {
      title: `Optional alternative — ${toner.product.name}`,
      detail: `Only if unwanted warmth has returned, use this INSTEAD OF ${shampoo?.product.name || 'your regular shampoo'} at the cleansing step, not after finishing the routine. Do not tone more often than every other wash. Keep masks and scrub for another wash; pause if hair feels dry or over-toned. ${toner.instruction}`,
    } : undefined;
    // Mark optional names in the actual order, without repeating a long disclaimer.
    layers = layers.map(s => {
      let detail = s.detail;
      for (const step of routine.filter(p => OPTIONAL_PRODUCT_IDS.has(p.product.id))) {
        detail = detail.replaceAll(step.product.name, `optional ${step.product.name}`);
      }
      return { ...s, detail };
    });
    return {
      day, date, phase: phase.number, kind: treatment ? 'treatment' : 'regular', washNumber: n,
      title: treatment ? `${maskToday ? 'Mask' : 'Scalp cleanse'} wash` : 'Your regular wash',
      note: `${context.hasSevereRedFlag ? 'Gentle interim care only, if tolerated. Professional advice takes priority over these planned dates; do not wait to seek care. No scalp serum, exfoliating scrub, toning shampoo or repair treatment is scheduled.' : treatmentNote} ${day === phase.to ? phase.milestone : ''}`,
      steps, layers, treatmentName: treatment?.product.name, optionalAlternative,
    };
  });
}
