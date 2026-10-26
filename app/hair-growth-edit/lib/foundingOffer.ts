export interface FoundingAvailability {
  claimed: number;
  reserved: number;
  available: number;
  limit: number;
  unitAmount: number;
  currency: 'usd';
}

export const FOUNDING_LIMIT = 100;
export const FOUNDING_AMOUNT = 4900;
export const REGULAR_AMOUNT = 6900;

// Preview only: the four historical sales reported by the business owner.
// Production must pass the server's availability instead of this snapshot.
export const FOUNDING_PREVIEW: FoundingAvailability = {
  claimed: 4, reserved: 0, available: 96, limit: FOUNDING_LIMIT,
  unitAmount: FOUNDING_AMOUNT, currency: 'usd',
};

export function parseFoundingAvailability(value: unknown): FoundingAvailability {
  const data = value as FoundingAvailability | null;
  if (!data || data.limit !== FOUNDING_LIMIT || data.currency !== 'usd' ||
      ![data.claimed, data.reserved, data.available].every(n => Number.isInteger(n) && n >= 0) ||
      data.claimed + data.reserved + data.available !== FOUNDING_LIMIT ||
      data.unitAmount !== (data.claimed === FOUNDING_LIMIT ? REGULAR_AMOUNT : FOUNDING_AMOUNT)) {
    throw new Error('Invalid founding-price availability');
  }
  return data;
}

export function isFoundingSoldOut(availability: FoundingAvailability) {
  return availability.claimed === availability.limit;
}

export function formatFoundingPrice(availability: FoundingAvailability) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: availability.currency, maximumFractionDigits: 0 })
    .format(availability.unitAmount / 100);
}
