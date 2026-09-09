import { supabase } from '@/lib/supabase/client';

export const PENDING_ANSWERS_KEY = 'ge_pending_answers';

export type AnswerMap = Record<string, number>;

// Loads the signed-in user's saved assessment, if any. Returns null when
// there is no session or no saved row.
export async function loadSavedAssessment(): Promise<AnswerMap | null> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return null;

  const { data } = await supabase
    .from('growth_edit_assessments')
    .select('answers')
    .eq('user_id', userId)
    .maybeSingle();

  return (data?.answers as AnswerMap | undefined) ?? null;
}

// Saves (or overwrites) the signed-in user's assessment answers.
export async function saveAssessment(answers: AnswerMap): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return;

  await supabase
    .from('growth_edit_assessments')
    .upsert({ user_id: userId, answers }, { onConflict: 'user_id' });
}

// Whether the signed-in user has an active entitlement for the Growth Edit.
export async function checkGrowthEditEntitlement(): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return false;

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', 'hair-growth-edit')
    .eq('is_published', true)
    .maybeSingle();
  if (!course) return false;

  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('status')
    .eq('user_id', userId)
    .eq('course_id', course.id)
    .eq('status', 'active')
    .maybeSingle();

  return !!entitlement;
}
