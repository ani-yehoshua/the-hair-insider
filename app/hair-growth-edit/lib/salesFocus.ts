export function getSalesFocus(primaryCause?: string): string {
  if (primaryCause === 'heat / chemical stress') {
    return 'Your answers point to a clearer priority: protect the hair you’re working to grow, with care built around your styling and services.';
  }
  if (primaryCause === 'product buildup') {
    return 'Your answers point to a simpler way forward: clear the buildup, instead of adding another layer.';
  }
  if (primaryCause === 'length protection (no dominant damage pattern)') {
    return 'Your answers point to a clearer focus: protect your length, instead of chasing the next quick fix.';
  }
  const focuses: Record<string, string> = {
    'dryness / low flexibility': 'helping dry lengths feel more flexible',
    'compromised internal strength': 'strength care for fragile lengths',
    'low-porosity resistance': 'choosing care that won’t leave hair feeling coated',
    'high-porosity moisture loss': 'helping your lengths hold on to moisture',
    'elasticity loss': 'balancing moisture and strength care',
    'mechanical tension': 'reducing friction and pulling on your hair',
    'breakage': 'protecting fragile lengths from further breakage',
    'shedding': 'gentle scalp and hair care while keeping track of shedding',
    'scalp imbalance': 'building a consistent scalp-care routine',
    'moisture + strength imbalance': 'balancing moisture and strength care',
    'mixed / uncertain porosity': 'starting simply and adjusting as you learn what works',
  };
  const focus = primaryCause ? focuses[primaryCause] : undefined;
  return focus
    ? `Based on your answers, start with ${focus}.`
    : 'Start with a routine based on your answers—not another product picked at random.';
}

export function getStartingFocusLabel(primaryCause: string): string {
  const labels: Record<string, string> = {
    'dryness / low flexibility': 'dryness and flexibility',
    'compromised internal strength': 'strength care for fragile lengths',
    'product buildup': 'buildup and a lighter-feeling routine',
    'low-porosity resistance': 'lighter layers and product application',
    'high-porosity moisture loss': 'moisture care for your lengths',
    'elasticity loss': 'flexibility and gentle handling',
    'heat / chemical stress': 'care around heat and chemical services',
    'mechanical tension': 'less pulling and friction',
    breakage: 'protecting fragile lengths',
    shedding: 'gentle care and monitoring shedding',
    'scalp imbalance': 'scalp comfort',
    'moisture + strength imbalance': 'moisture and strength care',
    'mixed / uncertain porosity': 'a simple routine you can adjust',
    'length protection (no dominant damage pattern)': 'protecting your length',
  };
  return labels[primaryCause] ?? 'a simple, consistent routine';
}

