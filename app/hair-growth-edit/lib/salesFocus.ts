export function getSalesFocus(primaryCause?: string): string {
  const focuses: Record<string, string> = {
    'dryness / low flexibility': 'helping dry lengths feel more flexible',
    'compromised internal strength': 'strength care for fragile lengths',
    'product buildup': 'clearing buildup without adding more layers',
    'low-porosity resistance': 'choosing care that won’t leave hair feeling coated',
    'high-porosity moisture loss': 'helping your lengths hold on to moisture',
    'elasticity loss': 'balancing moisture and strength care',
    'heat / chemical stress': 'caring for hair exposed to heat or chemical services',
    'mechanical tension': 'reducing friction and pulling on your hair',
    'breakage': 'protecting fragile lengths from further breakage',
    'shedding': 'gentle scalp and hair care while keeping track of shedding',
    'scalp imbalance': 'building a consistent scalp-care routine',
    'moisture + strength imbalance': 'balancing moisture and strength care',
    'mixed / uncertain porosity': 'starting simply and adjusting as you learn what works',
    'length protection (no dominant damage pattern)': 'protecting your lengths with a consistent routine',
  };
  const focus = primaryCause ? focuses[primaryCause] : undefined;
  return focus
    ? `Based on your answers, start with ${focus}.`
    : 'Start with a routine based on your answers—not another product picked at random.';
}

