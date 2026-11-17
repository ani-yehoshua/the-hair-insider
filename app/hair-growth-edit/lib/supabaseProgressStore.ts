/**
 * Production buyer-account adapter. SQL migration is a separate review file.
 * Uses the buyer's EXISTING Supabase session, never a new auth system or service key.
 * At port time point these imports at hair-growth-edit/lib and pass the existing
 * supabase client to createAccountProgressStore; do not use the preview store.
 */
import type { ProgressStore, RoutineProgress } from './routineMapTypes';
import { isRoutineProgress } from './routineProgress';

type Result = { data: unknown; error: { message: string } | null };
interface Selection {
  eq(column: string, value: string | number): Selection;
  maybeSingle(): PromiseLike<Result>;
}
interface Mutation {
  eq(column: string, value: string | number): Mutation;
  select(columns: string): Selection;
}
export interface AccountClient {
  auth: { getUser(): Promise<{ data: { user: { id: string; user_metadata?: Record<string, unknown> } | null }; error: unknown }> };
  from(table: 'growth_edit_routine_progress'): {
    select(columns: string): Selection;
    insert(value: Record<string, unknown>): Mutation;
    update(value: Record<string, unknown>): Mutation;
  };
}
export function createAccountProgressStore(client: AccountClient, planKey: string): ProgressStore {
  let ownerId: string | null = null;
  async function owner() {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) throw new Error('Sign in with the email you used at checkout to save or open your progress.');
    if (ownerId && ownerId !== data.user.id) throw new Error('Your signed-in account changed. Reload before saving so accounts stay separate.');
    ownerId = data.user.id;
    return data.user;
  }
  function record(data: unknown): RoutineProgress {
    const row = data as { progress?: unknown; revision?: number } | null;
    if (!row || !isRoutineProgress(row.progress, planKey) || row.revision !== row.progress.revision) {
      throw new Error('The saved log could not be confirmed. Reload before making further changes.');
    }
    return row.progress;
  }
  return {
    mode: 'account',
    async load() {
      const user = await owner();
      const { data, error } = await client.from('growth_edit_routine_progress')
        .select('progress, revision').eq('user_id', user.id).eq('plan_key', planKey).maybeSingle();
      if (error) throw new Error('Account progress could not be loaded. Your routine is still available; your saved log has not been overwritten.');
      const name = user.user_metadata?.first_name ?? user.user_metadata?.full_name ?? '';
      return { progress: data ? record(data) : null,
        firstName: typeof name === 'string' ? name.trim().split(/\s+/)[0].slice(0, 60) : '' };
    },
    async save(progress, expectedRevision) {
      const user = await owner();
      if (!isRoutineProgress(progress, planKey)) throw new Error('Check your progress entries before saving.');
      const next = { ...progress, revision: expectedRevision + 1 };
      const table = client.from('growth_edit_routine_progress');
      const mutation = expectedRevision === 0
        ? table.insert({ user_id: user.id, plan_key: planKey, revision: 1, progress: next })
        : table.update({ revision: next.revision, progress: next })
          .eq('user_id', user.id).eq('plan_key', planKey).eq('revision', expectedRevision);
      const { data, error } = await mutation.select('progress, revision').maybeSingle();
      if (error || !data) throw new Error('Your log changed in another tab, your session expired, or saving is unavailable. Keep your draft and reload the saved log before retrying.');
      return record(data);
    },
  };
}
