'use client';
import { useEffect, useState } from 'react';
import { parseFoundingAvailability, type FoundingAvailability } from './foundingOffer';

export function useFoundingAvailability() {
  const [availability, setAvailability] = useState<FoundingAvailability | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    let busy = false;
    const controller = new AbortController();
    const refresh = async () => {
      if (busy || document.visibilityState === 'hidden') return;
      busy = true;
      try {
        const response = await fetch('/api/hair-growth-edit/founding-offer', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Pricing is temporarily unavailable. Please try again shortly.');
        const next = parseFoundingAvailability(await response.json());
        if (active) { setAvailability(next); setError(null); }
      } catch (failure) {
        if (active && !controller.signal.aborted) {
          // Do not invent a count or keep showing an outdated $49 price on failure.
          setAvailability(null);
          setError(failure instanceof Error ? failure.message : 'Pricing is temporarily unavailable.');
        }
      } finally { busy = false; }
    };
    void refresh();
    const interval = window.setInterval(() => { void refresh(); }, 15_000);
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      active = false; controller.abort(); window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);
  return { availability, error };
}
