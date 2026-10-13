import type { ProductId, RoutineStep } from '../data/recommendations';

export type ShelfGroupId = 'start' | 'optional' | 'styling' | 'water';

export const PRODUCT_SHELF_GROUPS: Record<ProductId, ShelfGroupId> = {
  energizingShampoo: 'start',
  rebalancingShampoo: 'start',
  momoShampoo: 'start',
  oiShampoo: 'start',
  dedeShampoo: 'start',
  minuShampoo: 'start',
  heartShampoo: 'start',
  curlShampoo: 'start',
  momoConditioner: 'start',
  oiConditioner: 'start',
  dedeConditioner: 'start',
  minuConditioner: 'start',
  heartConditioner: 'start',
  curlConditioner: 'start',
  oiMilk: 'start',
  keratinLeaveIn: 'start',
  energizingSuperactive: 'optional',
  replumpingSuperactive: 'optional',
  detoxScrub: 'optional',
  oiMask: 'optional',
  nounouMask: 'optional',
  nourishingHairBuildingPak: 'optional',
  oiOil: 'optional',
  moroccanoilLight: 'optional',
  meluShield: 'styling',
  volumeMousse: 'styling',
  blowdryPrimer: 'styling',
  loveSmoothing: 'styling',
  curlSerum: 'styling',
  curlMousse: 'styling',
  bioIonicDryer: 'styling',
  bioIonicFlatIron: 'styling',
  bioIonicCurlingIron: 'styling',
  jolieFilteredShowerhead: 'water',
};

export interface ProductShelfGroup {
  id: ShelfGroupId;
  title: string;
  description: string;
  steps: RoutineStep[];
}

export function groupProductShelf(steps: RoutineStep[]): ProductShelfGroup[] {
  const groups: Omit<ProductShelfGroup, 'steps'>[] = [
    { id: 'start', title: 'Start here', description: 'Shampoo, conditioner, and leave-in' },
    { id: 'optional', title: 'Add if needed', description: 'Scalp serum, treatments, and oil' },
    { id: 'styling', title: 'For your styling routine', description: 'Products and tools for the style you wear' },
    { id: 'water', title: 'Your water setup', description: 'An optional choice for wash day' },
  ];

  return groups
    .map(group => ({
      ...group,
      steps: steps.filter(step => PRODUCT_SHELF_GROUPS[step.product.id] === group.id),
    }))
    .filter(group => group.steps.length > 0);
}
