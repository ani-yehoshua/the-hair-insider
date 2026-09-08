export type ProductId =
  | 'energizingShampoo' | 'rebalancingShampoo' | 'momoShampoo' | 'oiShampoo' | 'dedeShampoo'
  | 'minuShampoo' | 'heartShampoo' | 'curlShampoo'
  | 'momoConditioner' | 'oiConditioner' | 'dedeConditioner' | 'minuConditioner' | 'heartConditioner' | 'curlConditioner'
  | 'energizingSuperactive' | 'replumpingSuperactive' | 'detoxScrub'
  | 'oiMask' | 'nounouMask' | 'nourishingHairBuildingPak' | 'oiMilk' | 'keratinLeaveIn' | 'meluShield'
  | 'volumeMousse' | 'blowdryPrimer' | 'loveSmoothing' | 'curlSerum' | 'curlMousse'
  | 'oiOil' | 'moroccanoilLight' | 'jolieFilteredShowerhead'
  | 'bioIonicDryer' | 'bioIonicFlatIron' | 'bioIonicCurlingIron';

export interface ProductRecommendation {
  id: ProductId;
  name: string;
  brand: string;
  category: string;
  reason: string;
  link: string;
  image: string;
}

const PRODUCT_IMAGES: Record<ProductId, string> = {
  energizingShampoo: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-71252-energizing-shampoo-250ml-8004608255505-1.jpg?v=1760543183',
  rebalancingShampoo: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/knyhbd2mrvlj6uoaho8f.jpg?v=1719320576',
  momoShampoo: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-70000UCL-MOMO-SH-250ML-8004608299967-1.jpg?v=1777569772',
  oiShampoo: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-76004UCL-OI-SHAMPOO-280ml-8004608298489-1.jpg?v=1770304219',
  dedeShampoo: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-70021UCL-DEDE-SH-250ML-8004608300137-1.jpg?v=1777556881',
  minuShampoo: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-70026UCL-MINU-SH-250ML-8004608300168-1.jpg?v=1777570133',
  heartShampoo: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-72026UCL-silkening-chelating-shampoo-250ml-8004608301547-1_a3ec3418-c31c-4283-800f-972d4aaf90c5.jpg?v=1774360880',
  curlShampoo: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-70110UCL-LOVE-CURL-SH-250ML-8004608300670-1.jpg?v=1777568520',
  momoConditioner: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-70001SLC-MOMO-COND-250ML-8004608301950-1.jpg?v=1777569772',
  oiConditioner: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-76043UCL-OI-CONDITIONER-250ml-8004608298496-1.jpg?v=1760543182',
  dedeConditioner: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-70022SLC-DEDE-COND-250ML-8004608302001-1.jpg?v=1777561551',
  minuConditioner: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-70027SLC-MINU-COND-250ML-8004608302018-1.jpg?v=1777570133',
  heartConditioner: 'https://www.sephora.com/productimages/sku/s2973022-main-zoom.jpg',
  curlConditioner: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-70115SLC-LOVE-CURL-COND-250ML-8004608302056-1.jpg?v=1777568519',
  energizingSuperactive: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-71334-energizing-seasonal-superactive-100ml-8004608275381-1.jpg?v=1764792821',
  replumpingSuperactive: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-71337-replumping-hair-filler-superactive-leave-in-100ml-8004608275411-1.jpg?v=1770669979',
  detoxScrub: 'https://www.sephora.com/productimages/sku/s2815132-main-zoom.jpg',
  oiMask: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-76038UCL-OI-HAIR-BUTTER-250ml-8004608298519-1.jpg?v=1760543182',
  nounouMask: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-70034SLC-NOUNOU-MASK-250ML-8004608302049-1.jpg?v=1777574110',
  nourishingHairBuildingPak: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-71308-nourishing-hair-building-pak-250ml-8004608269199-1_0251748a-12e9-40fe-893d-d532115748d3.jpg?v=1764868975',
  oiMilk: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-76119UCL-OI-ALL-IN-ONE-MILK-135ml-8004608298526-1.jpg?v=1764175189',
  keratinLeaveIn: 'https://media.ulta.com/i/ulta/2243483?w=1080&h=1080&fmt=auto',
  meluShield: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-70008UCL-MELU-SPRAY-250ML-8004608300045-1.jpg?v=1777569340',
  volumeMousse: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-87164-volume-mousse-250ml-8004608290599-1.jpg?v=1760543184',
  blowdryPrimer: 'https://www.sephora.com/productimages/sku/s2816098-main-zoom.jpg',
  loveSmoothing: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-75583UCL-LOVE-SMOOTHING-PERFECTOR-150ml-8004608298694-1.jpg?v=1763592992',
  curlSerum: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-87130-this-is-a-curl-building-serum-250ml-8004608284390-1.jpg?v=1760460117',
  curlMousse: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-87052-this-is-a-curl-moisturizing-mousse-250ml-8004608247203-1.jpg?v=1760460118',
  oiOil: 'https://cdn.shopify.com/s/files/1/0052/8085/8198/files/Davines-76000FR-oi-oil-135ml-8004608288329-1.jpg?v=1760968815',
  moroccanoilLight: 'https://www.sephora.com/productimages/sku/s1869502-main-zoom.jpg',
  jolieFilteredShowerhead: 'https://cdn.shopify.com/s/files/1/0560/3062/5949/files/PDP_Modern_Chrome_1.jpg?v=1779390541',
  bioIonicDryer: 'https://cdn.shopify.com/s/files/1/0737/5775/3664/files/Z-10XDRYER_10X_Dryer.png?v=1762362049',
  bioIonicFlatIron: 'https://cdn.shopify.com/s/files/1/0737/5775/3664/files/10X_Styling_Iron_photo.png?v=1775749137',
  bioIonicCurlingIron: 'https://cdn.shopify.com/s/files/1/0737/5775/3664/files/Long_Barrel_1.5_1.png?v=1781713408',
};

const product = (
  id: ProductId, name: string, category: string, reason: string, link: string,
  brand = 'Davines',
): ProductRecommendation => ({ id, name, brand, category, reason, link, image: PRODUCT_IMAGES[id] });

export const PRODUCTS: Record<ProductId, ProductRecommendation> = {
  energizingShampoo: product('energizingShampoo', 'Energizing Shampoo', 'Scalp cleanse', 'A lightweight cleanse selected when density or shedding is the priority.', 'https://go.shopmy.us/p-27371596'),
  rebalancingShampoo: product('rebalancingShampoo', 'Rebalancing Shampoo', 'Scalp cleanse', 'Regulates an oily, congested scalp without loading the lengths.', 'https://go.shopmy.us/p-66731048'),
  momoShampoo: product('momoShampoo', 'MOMO Hydrating Shampoo for Dry Hair', 'Moisture cleanse', 'A gentle, moisture-forward cleanse for dry, coarse, curly, or coily lengths.', 'https://go.shopmy.us/p-68366953'),
  oiShampoo: product('oiShampoo', 'OI Shampoo for Softness and Shine', 'Balanced cleanse', 'A softening everyday cleanse for balanced strands.', 'https://go.shopmy.us/p-27370791'),
  dedeShampoo: product('dedeShampoo', 'DEDE Delicate Daily Shampoo', 'Light moisture cleanse', 'A delicate cleanse that supports fine, fragile hair without weighing it down.', 'https://go.shopmy.us/p-68367704'),
  minuShampoo: product('minuShampoo', 'MINU Shampoo for Colored Hair', 'Colour-safe cleanse', 'Protects deposited colour while gently cleansing.', 'https://go.shopmy.us/p-68369604'),
  heartShampoo: product('heartShampoo', 'Heart of Glass Silkening Shampoo for Blondes', 'Blonde cleanse', 'Moisturises and supports fragile lightened hair while controlling brass.', 'https://go.shopmy.us/p-68370676'),
  curlShampoo: product('curlShampoo', 'LOVE Curl Enhancing Shampoo for Curly Hair', 'Curl cleanse', 'A gentle curl cleanse that protects the natural oils curls and coils need.', 'https://go.shopmy.us/p-68368261'),
  momoConditioner: product('momoConditioner', 'MOMO Hydrating Conditioner for Dry Hair', 'Rich conditioner', 'Adds the slip and lasting moisture needed by coarse, dry, curly, or coily hair.', 'https://go.shopmy.us/p-68367319'),
  oiConditioner: product('oiConditioner', 'OI Conditioner for Softness and Shine', 'Light conditioner', 'Adds shine and slip without excess weight.', 'https://go.shopmy.us/p-66731205'),
  dedeConditioner: product('dedeConditioner', 'DEDE Delicate Daily Conditioner', 'Light conditioner', 'Softens and detangles fine hair while keeping roots light.', 'https://go.shopmy.us/p-68540265'),
  minuConditioner: product('minuConditioner', 'MINU Conditioner for Colored Hair', 'Colour-safe conditioner', 'Seals the cuticle to protect colour and shine.', 'https://go.shopmy.us/p-27371287'),
  heartConditioner: product('heartConditioner', 'Heart of Glass Rich Conditioner for Blondes', 'Blonde conditioner', 'Strengthens and deeply moisturises fragile lightened lengths.', 'https://go.shopmy.us/p-66731407'),
  curlConditioner: product('curlConditioner', 'LOVE Curl Enhancing Conditioner for Curly Hair', 'Curl conditioner', 'Provides slip for low-friction detangling and curl definition.', 'https://go.shopmy.us/p-68369149'),
  energizingSuperactive: product('energizingSuperactive', 'Energizing Seasonal Superactive', 'Scalp treatment', 'A consistent leave-on scalp step for a density- or shedding-led routine.', 'https://go.shopmy.us/p-27371775'),
  replumpingSuperactive: product('replumpingSuperactive', 'Replumping Hair Filler Superactive Leave-In', 'Strength treatment', 'Supports weak strands that have lost body and elasticity.', 'https://go.shopmy.us/p-66764639'),
  detoxScrub: product('detoxScrub', 'Detoxifying Scrub Shampoo', 'Clarifying treatment', 'Lifts buildup from dense or heavily coated roots; use no more than weekly.', 'https://go.shopmy.us/p-67238589'),
  oiMask: product('oiMask', 'OI Hair Butter for Softness and Shine', 'Moisture mask', 'A cushioning weekly moisture treatment for coarse, curly, or very dry hair.', 'https://go.shopmy.us/p-68540954'),
  nounouMask: product('nounouMask', 'NOUNOU Repair Hair Mask for Damaged Hair', 'Repair mask', 'A weekly reconstructing treatment for over-processed, damaged, or fragile lengths.', 'https://go.shopmy.us/p-68540346'),
  nourishingHairBuildingPak: product('nourishingHairBuildingPak', 'NOURISHING Hair Building Pak', 'Vegetal keratin treatment', 'Davines pairs vegetal keratin with its Biacidic Bond Complex to strengthen dry, brittle fibers. It is selected when your answers show that hair responds well to protein or needs structural reinforcement.', 'https://us.davines.com/products/nourishing-hair-building-pak'),
  oiMilk: product('oiMilk', 'OI All in One Hair Milk for Softness and Shine', 'Leave-in conditioner', 'A featherlight leave-in for slip, detangling, and shine without added protein.', 'https://go.shopmy.us/p-66732986'),
  keratinLeaveIn: product('keratinLeaveIn', 'Miracle Leave-In Conditioner Plus Keratin', 'Leave-in conditioner', 'A light strengthening leave-in that helps fine or compromised strands retain moisture.', 'https://go.shopmy.us/p-67238901', 'It’s a 10'),
  meluShield: product('meluShield', 'MELU Anti-Breakage Hair Shield for Long Hair', 'Heat protectant', 'Protects the cuticle before blow-drying or hot tools.', 'https://go.shopmy.us/p-68367514'),
  volumeMousse: product('volumeMousse', 'This Is A Volume Boosting Mousse', 'Styling', 'Builds touchable body without a heavy cream on fine hair.', 'https://go.shopmy.us/p-67239150'),
  blowdryPrimer: product('blowdryPrimer', 'This Is A Blow Dry Primer', 'Styling', 'Shortens drying time and smooths balanced hair.', 'https://go.shopmy.us/p-66734383'),
  loveSmoothing: product('loveSmoothing', 'LOVE Smoothing Perfector Heat Protectant Serum for Frizzy Hair', 'Styling', 'Controls frizz and humidity on coarse strands.', 'https://go.shopmy.us/p-68540699'),
  curlSerum: product('curlSerum', 'This Is A Curl Building Serum', 'Curl styling', 'Builds soft definition on soaking-wet curls.', 'https://go.shopmy.us/p-67253446'),
  curlMousse: product('curlMousse', 'This Is A Curl Moisturizing Mousse', 'Wave styling', 'Adds light definition and bounce without flattening waves.', 'https://go.shopmy.us/p-67238437'),
  oiOil: product('oiOil', 'OI Oil for Softness and Shine', 'Finishing oil', 'Seals dry ends and adds shine; dose lightly on fine hair.', 'https://go.shopmy.us/p-66735292'),
  moroccanoilLight: product('moroccanoilLight', 'Moroccanoil Treatment Light Mini', 'Blonde-safe finishing oil', 'A clear, lighter seal for blonde or fine ends without amber deposit.', 'https://go.shopmy.us/p-67240521', 'Moroccanoil'),
  jolieFilteredShowerhead: product('jolieFilteredShowerhead', 'The Jolie Filtered Showerhead + Filter', 'Water filtration', 'Reduces chlorine, heavy metals, bacteria, and scale before they reach the scalp and lengths, helping every routine start with cleaner shower water.', 'https://jolieskinco.com/products/the-jolie-showerhead', 'Jolie'),
  bioIonicDryer: product('bioIonicDryer', '10X™ UltraLight Speed Dryer', 'Blowout tool', 'Uses Bio Ionic moisturizing-heat technology and adjustable heat to create the smooth, stretched finish you actually wear while limiting unnecessary drying time.', 'https://go.shopmy.us/p-85121009', 'Bio Ionic'),
  bioIonicFlatIron: product('bioIonicFlatIron', '10X™ Styling Iron', 'Straightening tool', 'Uses sonic vibrating plates and Bio Ionic moisturizing-heat technology to create a smooth result with fewer repeated passes.', 'https://go.shopmy.us/p-85105251', 'Bio Ionic'),
  bioIonicCurlingIron: product('bioIonicCurlingIron', 'Long Barrel Curling Iron', 'Curling tool', 'The extended barrel and Bio Ionic mineral complex make it easier to form a consistent curl without repeatedly reheating the same section.', 'https://go.shopmy.us/p-85105165', 'Bio Ionic'),
};

export interface RoutineStep {
  order: number;
  timing: string;
  instruction: string;
  product: ProductRecommendation;
}

export type Diagnosis =
  | 'M' | 'P' | 'MP' | 'BU' | 'LP' | 'HP' | 'POROSITY_MIXED' | 'EL'
  | 'BR' | 'SH' | 'ME' | 'HC' | 'SC' | 'healthy';

export interface HairProfile {
  diagnosis: Diagnosis;
  secondaryDiagnosis: Diagnosis | null;
  texture: 'fine' | 'medium' | 'coarse';
  density: 'low' | 'medium' | 'high';
  pattern: 'straight' | 'wavy' | 'curly' | 'coily';
  stylePreference: 'natural' | 'blowout' | 'straightened' | 'curled' | 'protective';
  colour: 'natural' | 'colour' | 'blonde';
  dryScalp: boolean;
  oilyScalp: boolean;
  buildup: boolean;
  moistureNeed: boolean;
  strengthNeed: boolean;
  heatChemicalDamage: boolean;
  mechanicalTension: boolean;
  breakage: boolean;
  shedding: boolean;
  proteinSensitive: boolean;
  proteinPositive: boolean;
  washFrequency: 'daily' | 'severalWeekly' | 'weekly' | 'lessWeekly';
  lowConsistency: boolean;
  irritatedScalp: boolean;
}

function getWashSchedule(profile: HairProfile) {
  switch (profile.washFrequency) {
    case 'daily':
      return {
        shampoo: 'Every wash day; usually 4–7 times weekly',
        scalpSerum: '3 times weekly; not at every wash',
        targetedTreatment: 'Every 5–7 wash days (about once weekly)',
        moistureTreatment: 'Every 5–7 wash days (about once weekly)',
      };
    case 'severalWeekly':
      return {
        shampoo: 'Every wash day; usually 2–3 times weekly',
        scalpSerum: '2–3 times weekly, after washing',
        targetedTreatment: 'Every 3–4 wash days (about once weekly)',
        moistureTreatment: 'Every 3–4 wash days (about once weekly)',
      };
    case 'weekly':
      return {
        shampoo: 'Every wash day; about once weekly',
        scalpSerum: 'On wash day, once weekly',
        targetedTreatment: 'Every wash day, about once weekly',
        moistureTreatment: 'Every wash day, about once weekly',
      };
    case 'lessWeekly':
      return {
        shampoo: 'Every wash day; less than once weekly',
        scalpSerum: 'On wash day; about every 1–2 weeks',
        targetedTreatment: 'On a wash day every 1–2 weeks',
        moistureTreatment: 'On a wash day every 1–2 weeks',
      };
    default:
      // The app calculates an in-progress preview before this question is
      // answered. Keep that preview safe without treating it as a final result.
      return {
        shampoo: 'Every wash day',
        scalpSerum: 'After washing, up to 3 times weekly',
        targetedTreatment: 'No more than once weekly',
        moistureTreatment: 'No more than once weekly',
      };
  }
}

export function buildPaidRoutine(profile: HairProfile): RoutineStep[] {
  const curlish = profile.pattern === 'curly' || profile.pattern === 'coily';
  const wearsNaturalTexture = profile.stylePreference === 'natural';
  const usesHeatToStyle = ['blowout', 'straightened', 'curled'].includes(profile.stylePreference);
  const diagnosisClaimsCleanser = profile.diagnosis === 'SH' || profile.diagnosis === 'BU' || profile.diagnosis === 'SC';
  let shampoo: ProductId = profile.diagnosis === 'SH'
    ? 'energizingShampoo'
    : profile.diagnosis === 'BU' || profile.oilyScalp
      ? 'rebalancingShampoo'
      : profile.diagnosis === 'SC' || profile.irritatedScalp
        ? profile.texture === 'fine' ? 'dedeShampoo' : 'oiShampoo'
        : curlish ? 'curlShampoo' : profile.texture === 'fine' || profile.diagnosis === 'LP' ? 'dedeShampoo' : profile.texture === 'coarse' || profile.moistureNeed || profile.diagnosis === 'HP' ? 'momoShampoo' : 'oiShampoo';
  let conditioner: ProductId = curlish ? 'curlConditioner' : profile.texture === 'fine' ? 'dedeConditioner' : profile.texture === 'coarse' || profile.moistureNeed ? 'momoConditioner' : 'oiConditioner';
  if (profile.colour === 'colour' && !curlish) {
    conditioner = 'minuConditioner';
    if (!diagnosisClaimsCleanser) shampoo = 'minuShampoo';
  }
  if (profile.colour === 'blonde' && !curlish) {
    conditioner = 'heartConditioner';
    if (!diagnosisClaimsCleanser) shampoo = 'heartShampoo';
  }

  const treatment: ProductId | null = profile.diagnosis === 'BU' && !profile.irritatedScalp
      ? 'detoxScrub'
      : null;
  const mask: ProductId = profile.strengthNeed && !profile.proteinSensitive
    ? 'nourishingHairBuildingPak'
    : ['HC', 'BR'].includes(profile.diagnosis) ? 'nounouMask' : 'oiMask';
  // Keep protein targeted to the rinse-out treatment rather than stacking it
  // with a keratin leave-in on every wash day.
  const leaveIn: ProductId = 'oiMilk';
  const styling: ProductId | null = profile.stylePreference === 'protective'
    ? null
    : profile.stylePreference === 'blowout'
      ? 'blowdryPrimer'
      : profile.stylePreference === 'straightened' || profile.stylePreference === 'curled'
        ? profile.texture === 'coarse' ? 'loveSmoothing' : 'blowdryPrimer'
        : profile.pattern === 'wavy' ? 'curlMousse' : curlish ? 'curlSerum' : profile.texture === 'fine' ? 'volumeMousse' : profile.texture === 'coarse' ? 'loveSmoothing' : 'blowdryPrimer';
  const washSchedule = getWashSchedule(profile);
  const coreSteps: Array<[ProductId, string, string]> = [
    ['jolieFilteredShowerhead', 'Every shower; replace filter about every 90 days', 'Install the showerhead with its filter before beginning the routine. Keep the filter-change date visible so filtration stays effective.'],
    [shampoo, washSchedule.shampoo, profile.dryScalp ? 'Use one gentle scalp-focused lather, then rinse well.' : 'Massage at the scalp for 60 seconds; repeat only when residue remains.'],
    [conditioner, 'Every wash', 'Apply from mid-lengths to ends, detangle gently, then rinse.'],
    ['energizingSuperactive', `${washSchedule.scalpSerum}; continue for at least 3 months`, 'Section clean, towel-dried hair, apply directly across the scalp, and massage gently. Do not rinse. Patch test first and stop if irritation occurs.'],
  ];
  if (treatment) {
    coreSteps.push([
      treatment,
      treatment === 'detoxScrub' ? `${washSchedule.targetedTreatment}; never more than once weekly` : washSchedule.targetedTreatment,
      treatment === 'detoxScrub'
        ? 'Use in place of shampoo on a treatment wash day; do not use at every wash. Rinse thoroughly.'
        : 'Part towel-dried hair, apply to the scalp or lengths as directed, and leave in.',
    ]);
  }
  coreSteps.push([
    mask,
    washSchedule.moistureTreatment,
    mask === 'nourishingHairBuildingPak'
      ? `Use after shampooing in place of conditioner on a treatment wash day. Apply through the lengths, leave on for 10 minutes, comb through, then rinse thoroughly. Do not use it at every wash; follow the ${washSchedule.targetedTreatment.toLowerCase()} cadence.`
      : 'Use after cleansing in place of conditioner; leave 5–10 minutes and rinse.',
  ]);
  coreSteps.push([leaveIn, 'Every wash', `Apply to ${curlish && wearsNaturalTexture ? 'soaking-wet' : 'damp'} mid-lengths and ends before styling.`]);

  if (profile.diagnosis === 'HC' || profile.heatChemicalDamage || usesHeatToStyle) {
    coreSteps.push(['meluShield', 'Before any heat', 'Apply before every dryer or hot tool; skip only when fully air-drying.']);
  }
  if (!profile.lowConsistency) {
    if (styling) {
      coreSteps.push([styling, 'As you style', curlish && wearsNaturalTexture ? 'Apply on soaking-wet hair, scrunch, and air-dry or diffuse on low.' : 'Apply sparingly through damp hair, then create your usual finished style.']);
    }
    coreSteps.push([profile.colour === 'blonde' || profile.texture === 'fine' ? 'moroccanoilLight' : 'oiOil', 'Ends, as needed', 'Warm one or two drops in palms and smooth only over the ends.']);
  }
  if (profile.stylePreference === 'blowout') {
    coreSteps.push(['bioIonicDryer', 'On blowout days', 'Rough-dry on low or medium until about 80% dry, then finish in sections with controlled tension. Keep the dryer moving and use the lowest effective heat.']);
  } else if (profile.stylePreference === 'straightened') {
    coreSteps.push(['bioIonicFlatIron', 'On straightening days', 'Work in small, fully dry sections at the lowest effective temperature. Use one slow pass instead of repeatedly ironing the same section.']);
  } else if (profile.stylePreference === 'curled') {
    coreSteps.push(['bioIonicCurlingIron', 'On curling days', 'Start with fully dry, heat-protected hair. Use the lowest effective temperature, hold briefly, then let each curl cool before touching it.']);
  }

  return coreSteps.map(([id, timing, instruction], index) => ({ order: index + 1, timing, instruction, product: PRODUCTS[id] }));
}

export function selectFoundationRecommendations(
  profile: HairProfile,
  routine: RoutineStep[],
): [ProductRecommendation, ProductRecommendation, ProductRecommendation] {
  const shampoo = routine.find((step) => step.product.category.toLowerCase().includes('cleanse'))?.product ?? PRODUCTS.oiShampoo;
  const conditioner = routine.find((step) => step.product.category.toLowerCase().includes('conditioner'))?.product ?? PRODUCTS.oiConditioner;
  const oil = profile.colour === 'blonde' || profile.texture === 'fine' ? PRODUCTS.moroccanoilLight : PRODUCTS.oiOil;
  const preferredIds: ProductId[] = [];

  if (profile.strengthNeed && !profile.proteinSensitive) preferredIds.push('nourishingHairBuildingPak');
  if (profile.irritatedScalp || profile.diagnosis === 'SC') preferredIds.push(shampoo.id, conditioner.id);
  else {
    switch (profile.diagnosis) {
      case 'SH': preferredIds.push('energizingShampoo', 'energizingSuperactive'); break;
      case 'BU': preferredIds.push(shampoo.id, 'detoxScrub'); break;
      case 'HC': preferredIds.push('meluShield', 'nounouMask'); break;
      case 'ME': preferredIds.push(conditioner.id, oil.id); break;
      case 'BR': preferredIds.push('nounouMask', 'oiMilk'); break;
      case 'P':
      case 'EL':
      case 'MP': preferredIds.push('nourishingHairBuildingPak', 'oiMilk'); break;
      case 'HP': preferredIds.push(conditioner.id, oil.id); break;
      case 'M': preferredIds.push(conditioner.id, 'oiMilk'); break;
      case 'LP':
      case 'POROSITY_MIXED': preferredIds.push(shampoo.id, 'oiMilk'); break;
      default: preferredIds.push(shampoo.id, conditioner.id);
    }
  }

  const routineProducts = new Map(routine.map(step => [step.product.id, step.product]));
  const selected: ProductRecommendation[] = [];
  const addIfInRoutine = (id: ProductId) => {
    const candidate = routineProducts.get(id);
    if (candidate && !selected.some(product => product.id === id)) selected.push(candidate);
  };
  preferredIds.forEach(addIfInRoutine);
  routine
    .filter(step => !['jolieFilteredShowerhead', 'energizingSuperactive'].includes(step.product.id))
    .forEach(step => addIfInRoutine(step.product.id));
  routine.forEach(step => addIfInRoutine(step.product.id));

  return [selected[0], selected[1], selected[2]];
}