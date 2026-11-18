import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createProgress, isRoutineProgress } from '../lib/routineProgress';
import type { ProgressStore, RoutineProgress } from '../lib/routineMapTypes';

type Patch = Partial<Pick<RoutineProgress, 'firstName' | 'startDate' | 'completedDays' | 'checkIns'>>;
export function useRoutineProgress(planKey: string, suppliedStore?: ProgressStore) {
  const store = useMemo(() => suppliedStore ?? { mode: 'account' as const, load: async () => { throw new Error('Sign in with the email you used at checkout to open your saved progress.'); }, save: async () => { throw new Error('Account progress is unavailable. Your entries have not been overwritten.'); } }, [planKey, suppliedStore]);
  const [progress, setProgress] = useState<RoutineProgress | null>(null);
  const [firstName, setFirstName] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = useRef<RoutineProgress | null>(null);
  const loaded = useRef(false);
  const saving = useRef(false);
  const generation = useRef(0);
  const reload = useCallback(async () => {
    const epoch = ++generation.current;
    loaded.current = false;
    setLoading(true);
    setError(null);
    // Never show a previous buyer's or previous assessment's log while loading.
    current.current = null;
    setProgress(null);
    try {
      const result = await store.load();
      if (epoch !== generation.current) return;
      if (result.progress && !isRoutineProgress(result.progress, planKey)) throw new Error('This saved map could not be read safely.');
      const next = result.progress ?? createProgress(planKey, result.firstName);
      current.current = next; setProgress(next); setFirstName(result.firstName);
      loaded.current = true;
    } catch (e) {
      if (epoch === generation.current) setError(e instanceof Error ? e.message : 'Your saved log could not be loaded. Please retry.');
    } finally { if (epoch === generation.current) setLoading(false); }
  }, [planKey, store]);
  useEffect(() => { void reload(); return () => { generation.current++; }; }, [reload]);
  const update = useCallback(async (patch: Patch): Promise<boolean> => {
    if (!loaded.current || !current.current || saving.current) return false;
    const previous = current.current, epoch = generation.current;
    const next = { ...previous, ...patch };
    if (!isRoutineProgress(next, planKey)) { setError('Please check the ratings, date and note length before saving.'); return false; }
    if (patch.startDate && patch.startDate !== previous.startDate &&
      (previous.completedDays.length || Object.keys(previous.checkIns).length)) {
      setError('Your start date is locked once you begin logging, so your saved days stay aligned.'); return false;
    }
    saving.current = true; setSaving(true); setError(null);
    try {
      const result = await store.save(next, previous.revision);
      if (epoch !== generation.current) return false;
      if (!isRoutineProgress(result, planKey) || result.revision !== previous.revision + 1) throw new Error('The service did not confirm this revision. Please reload your saved log.');
      current.current = result; setProgress(result);
      return true;
    } catch (e) {
      if (epoch === generation.current) setError(e instanceof Error ? e.message : 'Your changes were not saved. Please try again.');
      return false;
    } finally { saving.current = false; if (epoch === generation.current) setSaving(false); }
  }, [planKey, store]);
  return { progress, firstName, isLoading, isSaving, error, reload, update, mode: store.mode };
}
