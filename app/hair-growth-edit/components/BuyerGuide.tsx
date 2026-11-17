'use client';
import { useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { RoutineMapGuide } from './routine-map/RoutineMapGuide';
import { createAccountProgressStore, type AccountClient } from '../lib/supabaseProgressStore';
import { getPlanKey } from '../lib/routineCalendar';
import { getProfessionalCareContext } from '../lib/professionalCareClient';
import type { MapContext } from '../lib/routineMapTypes';
import type { PlanPayload } from '../hooks/usePlanResults';

export default function BuyerGuide({ payload, answers, onBack }: {
  payload: PlanPayload; answers: Record<string, number>; onBack: () => void;
}) {
  const context = useMemo<MapContext>(() => {
    const r = payload.result;
    return getProfessionalCareContext({
      routine: r.paidRoutine, answers, focus: r.primaryCause, observations: r.observations,
      habit: r.behaviorToStop, washFrequency: r.washFrequency, stylePreference: r.stylePreference,
      shouldShampooTwice: r.shouldShampooTwice, reportedDensityChange: answers.density === 3,
      hasSevereRedFlag: r.hasSevereRedFlag, defaultProductIds: payload.defaultProductIds,
    });
  }, [payload, answers]);
  const planKey = getPlanKey(context);
  // Isolate the SDK's recursive generic query-builder types at this adapter boundary.
  const store = useMemo(() => createAccountProgressStore(supabase as unknown as AccountClient, planKey), [planKey]);
  return <RoutineMapGuide key={planKey} context={context} progressStore={store} onBack={onBack} />;
}
