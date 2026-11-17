import { useEffect, useState } from 'react';
import type { PublicResults } from '../lib/publicResults';

export interface PlanPayload {
  access: 'paid' | 'free';
  result: PublicResults;
  defaultProductIds?: string[];
}
export function usePlanResults(answers: Record<string, number>, ready: boolean, accountId: string | null) {
  const serialized = JSON.stringify(answers);
  const key = `${accountId ?? 'guest'}:${serialized}`;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ key: string; data: PlanPayload | null; error: string | null }>({ key: '', data: null, error: null });
  useEffect(() => {
    const controller = new AbortController();
    setState({ key, data: null, error: null });
    if (!ready) return () => controller.abort();
    void (async () => {
      try {
        const response = await fetch('/api/hair-growth-edit/plan', {
          method: 'POST', credentials: 'same-origin', cache: 'no-store',
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: JSON.parse(serialized) }),
          signal: controller.signal,
        });
        const payload = await response.json();
        if (!response.ok || !payload.result || !['free', 'paid'].includes(payload.access)) {
          throw new Error(payload.error || 'We could not open your results. Please retry.');
        }
        if (!controller.signal.aborted) setState({ key, data: payload, error: null });
      } catch (error) {
        if (!controller.signal.aborted) setState({ key, data: null, error: error instanceof Error ? error.message : 'Please retry.' });
      }
    })();
    return () => controller.abort();
  }, [key, serialized, ready, attempt]);
  return { data: state.key === key ? state.data : null,
    error: state.key === key ? state.error : null, retry: () => setAttempt(n => n + 1) };
}
