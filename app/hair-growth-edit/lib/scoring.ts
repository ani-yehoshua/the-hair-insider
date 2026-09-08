import { QUESTIONS, type Dimension } from '../data/questions.ts';
import {
  buildPaidRoutine,
  selectFoundationRecommendations,
  type Diagnosis,
  type ProductRecommendation,
} from '../data/recommendations.ts';

export type AnswerMap = Record<string, number>; // questionId -> option index

const DIMENSIONS: Dimension[] = [
  'M', 'P', 'BU', 'LP', 'HP', 'EL', 'BR', 
  'SH', 'ME', 'HC', 'SC', 'CO', 'RF',
  'fine', 'medium', 'coarse', 'mixedDiameter',
  'straight', 'wavy', 'curly', 'coily',
  'lowDensity', 'mediumDensity', 'highDensity'
];

export const MAX_SCORES = Object.fromEntries(
  DIMENSIONS.map(dim => [
    dim,
    QUESTIONS.reduce((sum, q) => sum + Math.max(0, ...q.options.map(o => o.scores[dim] || 0)), 0)
  ])
) as Record<Dimension, number>;

export type ProductResult = ProductRecommendation;

export function calculateResults(answers: AnswerMap) {
  const scores: Record<Dimension, number> = {} as any;
  const evidenceCount: Record<Dimension, number> = {} as any;
  const evidenceByDimension: Record<Dimension, string[]> = {} as any;
  DIMENSIONS.forEach(d => { scores[d] = 0; evidenceCount[d] = 0; evidenceByDimension[d] = []; });

  const structuralDimensions = new Set([
    'fine', 'medium', 'coarse', 'mixedDiameter',
    'straight', 'wavy', 'curly', 'coily',
    'lowDensity', 'mediumDensity', 'highDensity'
  ]);
  const structuralQIds = ['diameter', 'pattern', 'density'];

  const damageObservations: string[] = [];
  const healthyObservations: string[] = [];

  for (const q of QUESTIONS) {
    const qId = q.id;
    const optionIdx = answers[qId];
    if (optionIdx === undefined) continue;
    const option = q.options[optionIdx];
    if (!option) continue;

    let isDamage = false;
    for (const [dimStr, val] of Object.entries(option.scores)) {
      const dim = dimStr as Dimension;
      scores[dim] += val;
      evidenceCount[dim] += 1;
      if (val > 0 && !evidenceByDimension[dim].includes(option.label.toLowerCase())) {
        evidenceByDimension[dim].push(option.label.toLowerCase());
      }
      if (!structuralDimensions.has(dim) && dim !== 'CO') {
        isDamage = true;
      }
    }

    if (!structuralQIds.includes(qId)) {
      const label = option.label.toLowerCase();
      const isExcluded = ["no", "none", "nothing", "hardly any", "unsure", "cannot test", "never used", "rarely", "nowhere", "little change"].includes(label);
      
      if (!isExcluded && label.length > 4) {
        if (isDamage) {
          if (damageObservations.length < 4) damageObservations.push(label);
        } else {
          if (healthyObservations.length < 4) healthyObservations.push(label);
        }
      }
    }
  }

  const getNorm = (dim: Dimension) => MAX_SCORES[dim] > 0 ? (scores[dim] / MAX_SCORES[dim]) : 0;
  
  const mNorm = getNorm('M');
  const pNorm = getNorm('P');
  const buNorm = getNorm('BU');
  const hcNorm = getNorm('HC');
  const meNorm = getNorm('ME');
  const brNorm = getNorm('BR');
  const shNorm = getNorm('SH');
  const scNorm = getNorm('SC');
  const positiveProteinResponse = answers.proteinResponse === 0;
  const corroboratingStrengthSignal =
    answers.mushy === 1 || answers.mushy === 2 || answers.mushy === 3 ||
    answers.elasticity === 2 ||
    answers.chemical === 2 || answers.chemical === 3 || answers.chemical === 4;
  const proteinSupportConfirmed = positiveProteinResponse && corroboratingStrengthSignal;

  let primaryCause = "";
  let isHealthyFallback = false;
  let product1: ProductResult | null;
  let product2: ProductResult | null;
  let product3: ProductResult | null;
  let behaviorToStop = "over-handling your hair";
  
  let validCauses: {dim: Diagnosis, norm: number, name: string}[] = [];
  
  if (mNorm >= 0.35 && evidenceCount['M'] >= 2) validCauses.push({dim: 'M', norm: mNorm, name: 'dryness / low flexibility'});
  if ((pNorm >= 0.35 && evidenceCount['P'] >= 2) || proteinSupportConfirmed) {
    validCauses.push({dim: 'P', norm: Math.max(pNorm, 0.4), name: 'compromised internal strength'});
  }
  if (buNorm >= 0.35 && evidenceCount['BU'] >= 2) validCauses.push({dim: 'BU', norm: buNorm, name: 'product buildup'});
  if (getNorm('LP') >= 0.35 && evidenceCount['LP'] >= 2) validCauses.push({dim: 'LP', norm: getNorm('LP'), name: 'low-porosity resistance'});
  if (getNorm('HP') >= 0.35 && evidenceCount['HP'] >= 2) validCauses.push({dim: 'HP', norm: getNorm('HP'), name: 'high-porosity moisture loss'});
  if (getNorm('EL') >= 0.35 && evidenceCount['EL'] >= 2) validCauses.push({dim: 'EL', norm: getNorm('EL'), name: 'elasticity loss'});
  if (hcNorm >= 0.35 && evidenceCount['HC'] >= 2) validCauses.push({dim: 'HC', norm: hcNorm, name: 'heat / chemical stress'});
  if (meNorm >= 0.35 && evidenceCount['ME'] >= 2) validCauses.push({dim: 'ME', norm: meNorm, name: 'mechanical tension'});
  if (brNorm >= 0.35 && evidenceCount['BR'] >= 2) validCauses.push({dim: 'BR', norm: brNorm, name: 'breakage'});
  if (shNorm >= 0.35 && evidenceCount['SH'] >= 2) validCauses.push({dim: 'SH', norm: shNorm, name: 'shedding'});
  if (scNorm >= 0.35 && evidenceCount['SC'] >= 2) validCauses.push({dim: 'SC', norm: scNorm, name: 'scalp imbalance'});

  validCauses.sort((a, b) => b.norm - a.norm);

  // Direct residue + clarifying response confirms buildup. It outranks
  // low-porosity symptoms because buildup can itself cause slow wetting/drying.
  const confirmedBuildup = (answers.residue === 1 || answers.residue === 2) && answers.clarify === 0;
  if (confirmedBuildup) {
    const buildupIndex = validCauses.findIndex(c => c.dim === 'BU');
    if (buildupIndex > 0) {
      const [buildup] = validCauses.splice(buildupIndex, 1);
      validCauses.unshift(buildup);
    }
  }

  // Damage source (ME or HC) outranks symptom (BR)
  const sourceIndex = validCauses.findIndex(c => (c.dim === 'ME' || c.dim === 'HC') && c.norm >= 0.4);
  const brIndex = validCauses.findIndex(c => c.dim === 'BR');
  if (sourceIndex !== -1 && brIndex !== -1 && brIndex < sourceIndex) {
    const temp = validCauses[sourceIndex];
    validCauses[sourceIndex] = validCauses[brIndex];
    validCauses[brIndex] = temp;
  }
  
  if (validCauses.length > 0 && validCauses[0].norm >= 0.4) {
    primaryCause = validCauses[0].name;
  }

  const bothMP = (mNorm >= 0.35 && pNorm >= 0.35 && evidenceCount['M'] >= 2 && evidenceCount['P'] >= 2);
  let diagnosis: Diagnosis = (validCauses[0]?.dim ?? 'healthy') as Diagnosis;
  let secondaryDiagnosis: Diagnosis | null = validCauses[1]?.dim ?? null;
  let secondaryCause: string | null = validCauses[1]?.name ?? null;
  if (bothMP) {
    primaryCause = 'moisture + strength imbalance';
    diagnosis = 'MP';
  }
  const lpNorm = getNorm('LP');
  const hpNorm = getNorm('HP');
  const mixedPorosity = lpNorm >= 0.35 && hpNorm >= 0.35;
  if (mixedPorosity && !confirmedBuildup && Math.max(lpNorm, hpNorm) >= 0.4) {
    primaryCause = 'mixed / uncertain porosity';
    diagnosis = 'POROSITY_MIXED';
    secondaryDiagnosis = null;
    secondaryCause = null;
  }

  let finalObservations: string[] = [];

  if (primaryCause) {
    const winningDimensions: Dimension[] = diagnosis === 'MP'
      ? ['M', 'P']
      : diagnosis === 'POROSITY_MIXED' ? ['LP', 'HP'] : [diagnosis as Dimension];
    finalObservations = winningDimensions.flatMap((dim) => evidenceByDimension[dim]).filter((item, index, all) => all.indexOf(item) === index).slice(0, 2);
    if (finalObservations.length < 2) {
      finalObservations.push(`your ${primaryCause} answers`);
    }
    if (finalObservations.length < 2) {
      finalObservations.push("the repeated evidence in this pattern");
    }
  } else {
    // Deterministic healthy fallback
    primaryCause = "length protection (no dominant damage pattern)";
    isHealthyFallback = true;
    diagnosis = 'healthy';
    secondaryDiagnosis = null;
    secondaryCause = null;
    finalObservations = healthyObservations.slice(0, 2);
    if (finalObservations.length < 2) {
      finalObservations = ["consistent routine", "stable growth patterns"];
    }
  }

  const texture = answers.diameter === 0 ? 'fine' : answers.diameter === 2 ? 'coarse' : 'medium';
  const pattern = answers.pattern === 1 ? 'wavy' : answers.pattern === 2 ? 'curly' : answers.pattern === 3 ? 'coily' : 'straight';
  const density = answers.density === 0 || answers.density === 3 ? 'low' : answers.density === 2 ? 'high' : 'medium';
  const colour = answers.chemical === 2 ? 'blonde' : answers.chemical === 1 || answers.chemical === 3 || answers.chemical === 4 ? 'colour' : 'natural';
  const stylePreference = answers.usualStyle === 1
    ? 'blowout'
    : answers.usualStyle === 2
      ? 'straightened'
      : answers.usualStyle === 3
        ? 'curled'
        : answers.usualStyle === 4 ? 'protective' : 'natural';
  const washFrequency = answers.shampooFrequency === 0
    ? 'daily'
    : answers.shampooFrequency === 1
      ? 'severalWeekly'
      : answers.shampooFrequency === 2
        ? 'weekly'
        : 'lessWeekly';
  const profile = {
    diagnosis,
    secondaryDiagnosis,
    texture, pattern, density, colour, stylePreference,
    dryScalp: answers.scalp === 2 || answers.scalp === 3,
    oilyScalp: answers.scalp === 1,
    buildup: buNorm >= 0.4,
    moistureNeed: bothMP || mNorm >= 0.4,
    strengthNeed: positiveProteinResponse || bothMP || (pNorm >= 0.35 && evidenceCount['P'] >= 2),
    heatChemicalDamage: hcNorm >= 0.4,
    mechanicalTension: meNorm >= 0.4,
    breakage: brNorm >= 0.4,
    shedding: shNorm >= 0.4,
    proteinSensitive: answers.proteinResponse === 1,
    proteinPositive: positiveProteinResponse,
    washFrequency,
    lowConsistency: answers.consistency === 2 || answers.consistency === 3,
    irritatedScalp: scNorm >= 0.4 || answers.scalp === 3 || answers.scalp === 4,
  } as const;
  const paidRoutine = buildPaidRoutine(profile);
  [product1, product2, product3] = selectFoundationRecommendations(profile, paidRoutine);

  const supportingNeeds: string[] = [];
  if (positiveProteinResponse) {
    const proteinTiming = paidRoutine.find(step => step.product.id === 'nourishingHairBuildingPak')?.timing;
    supportingNeeds.push(
      `You reported stronger, bouncier hair after a protein or keratin treatment, so the routine includes one targeted Davines vegetal-keratin treatment${proteinTiming ? ` ${proteinTiming.toLowerCase()}` : ''}. It is not layered with another protein leave-in.`,
    );
  } else if (answers.proteinResponse === 1) {
    supportingNeeds.push(
      'You reported hair feeling hard or strawlike after protein, so the routine avoids adding a keratin or protein treatment for now.',
    );
  }
  if (answers.wetFrizz === 1 || answers.wetFrizz === 2) {
    supportingNeeds.push(
      'You reported frizz while soaking wet, so the routine prioritizes moisture retention, gentle handling, and protection of the cuticle.',
    );
  }
  if (profile.stylePreference !== 'natural') {
    const styleLabels = {
      blowout: 'blowouts',
      straightened: 'straightened styles',
      curled: 'curled or waved styles',
      protective: 'protective styles',
    } as const;
    supportingNeeds.push(
      `You usually wear ${styleLabels[profile.stylePreference]}, so the styling recommendations follow that finished look rather than your natural texture alone.`,
    );
  }

  // Behavior to stop
  if (hcNorm >= 0.4) behaviorToStop = 'frequent high-heat styling or overlapping chemical processes';
  else if (meNorm >= 0.4) behaviorToStop = 'tight hairstyles and excessive tension';
  else if (buNorm >= 0.4) behaviorToStop = 'layering heavy products without regular clarifying';
  else if (brNorm >= 0.4) behaviorToStop = 'rough detangling on dry ends';
  else if (isHealthyFallback) behaviorToStop = 'inconsistent routines and unnecessary mechanical friction';

  // Red flags
  const redFlagScore = scores['RF'];
  const hasSevereRedFlag = redFlagScore >= 3;
  const hasMinorRedFlag = redFlagScore > 0 && redFlagScore < 3;
  if (hasSevereRedFlag) {
    product1 = null;
    product2 = null;
    product3 = null;
  }

  // Shampoo rule
  const shampooFreqIdx = answers['shampooFrequency'];
  const isDaily = shampooFreqIdx === 0; 
  const isDryScalp = answers['scalp'] === 2 || answers['scalp'] === 3;
  const shouldShampooTwice = !isDaily && !isDryScalp;

  return {
    primaryCause,
    bothMP,
    secondaryCause,
    observations: finalObservations,
    product1,
    product2,
    product3,
    paidRoutine: hasSevereRedFlag ? [] : paidRoutine,
    supportingNeeds: hasSevereRedFlag ? [] : supportingNeeds,
    behaviorToStop,
    hasSevereRedFlag,
    hasMinorRedFlag,
    shouldShampooTwice
  };
}