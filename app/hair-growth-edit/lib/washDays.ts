import type { RoutineStep } from '../data/recommendations';

export function getWashDayPlan(routine: RoutineStep[], hasSevereRedFlag = false) {
  const shampoo = routine.find(step => step.product.category.toLowerCase().includes('cleanse') && step.product.id !== 'detoxScrub');
  const conditioner = routine.find(step => step.product.category.toLowerCase().includes('condition'));
  const leaveIn = routine.find(step => step.product.category.toLowerCase().includes('leave-in'));
  const mask = hasSevereRedFlag ? undefined : routine.find(step =>
    ['nounouMask', 'oiMask', 'nourishingHairBuildingPak'].includes(step.product.id),
  );
  const scrub = hasSevereRedFlag ? undefined : routine.find(step => step.product.id === 'detoxScrub');
  const regular = [shampoo?.product.name, conditioner?.product.name, leaveIn?.product.name].filter((name): name is string => Boolean(name));
  const followsWithConditioner = mask?.product.id === 'nourishingHairBuildingPak';
  const treatment = mask
    ? [shampoo?.product.name, mask.product.name, followsWithConditioner ? conditioner?.product.name : undefined, leaveIn?.product.name].filter((name): name is string => Boolean(name))
    : [];
  return {
    regular,
    treatment,
    mask,
    scrub,
    followsWithConditioner,
    startsOnFirstWash: mask?.product.id === 'nounouMask' || followsWithConditioner,
    everyWash: Boolean(mask && /^Every wash day/i.test(mask.timing)),
  };
}
