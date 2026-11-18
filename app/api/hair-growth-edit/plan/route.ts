import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { QUESTIONS, getSelectedOption } from '@/app/hair-growth-edit/data/questions';
import { hasCompleteRoutineAnswers } from '@/app/hair-growth-edit/lib/assessmentCompleteness';
import { calculateResults } from '@/app/hair-growth-edit/lib/scoring';
import { makePublicResults } from '@/app/hair-growth-edit/lib/publicResults';
import { washFrequencyAssumption } from '@/app/hair-growth-edit/lib/washFrequency';
import { getGentleInterimRoutine } from '@/app/hair-growth-edit/lib/professionalCare';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store, max-age=0', Vary: 'Cookie, Authorization' };
export async function POST(request: Request) {
  if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Please open your results on this site.' }, { status: 403, headers });
  }
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid answers.' }, { status: 400, headers });
  }
  const answers = (body as { answers?: unknown } | null)?.answers;
  if (!answers || typeof answers !== 'object' || Array.isArray(answers) ||
      Object.keys(answers).some(id => !QUESTIONS.some(q => q.id === id)) ||
      Object.entries(answers).some(([id, value]) => typeof value !== 'number' ||
        !Number.isInteger(value) || !getSelectedOption(QUESTIONS.find(q => q.id === id)!, value))) {
    return NextResponse.json({ error: 'Please check your assessment answers.' }, { status: 400, headers });
  }
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  let paid = false;
  if (user) {
    const course = await client.from('courses').select('id').eq('slug', 'hair-growth-edit')
      .eq('is_published', true).maybeSingle();
    if (course.error) return NextResponse.json({ error: 'We could not verify your access. Please retry.' }, { status: 503, headers });
    if (course.data) {
      const entitlement = await client.from('entitlements').select('status').eq('user_id', user.id)
        .eq('course_id', course.data.id).eq('status', 'active').maybeSingle();
      if (entitlement.error) return NextResponse.json({ error: 'We could not verify your access. Please retry.' }, { status: 503, headers });
      paid = !!entitlement.data;
    }
  }
  const accepted = answers as Record<string, number>;
  if (!hasCompleteRoutineAnswers(accepted, QUESTIONS.map(q => q.id), paid)) {
    return NextResponse.json({ error: 'Finish your assessment to open your plan.' }, { status: 400, headers });
  }
  // Ownership, not a client toggle or a severe-flag result, controls disclosure.
  if (!paid) return NextResponse.json({ access: 'free', result: makePublicResults(accepted) }, { headers });
  const result = calculateResults(accepted);
  if (result.hasSevereRedFlag) {
    result.paidRoutine = getGentleInterimRoutine(result.paidRoutine);
    result.product1 = result.paidRoutine[0]?.product ?? null;
    result.product2 = result.paidRoutine[1]?.product ?? null;
  }
  return NextResponse.json({
    access: 'paid',
    result: { ...result, teaser: null, washFrequencyAssumption: washFrequencyAssumption(accepted.shampooFrequency) },
    defaultProductIds: calculateResults({}).paidRoutine.map(s => s.product.id),
  }, { headers });
}
