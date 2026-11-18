import { useMemo, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import './routine-map.css';
import type { CheckIn, MapContext, ProgressStore } from '../../lib/routineMapTypes';
import { buildRoutineCalendar, getMapPhases, getPlanKey, localDate } from '../../lib/routineCalendar';
import { getProgressStats } from '../../lib/routineProgress';
import { useRoutineProgress } from '../../hooks/useRoutineProgress';
import { MapCover, MapSetup, FounderNote } from './MapCover';
import { CalendarView } from './CalendarView';
import { DayDetail } from './DayDetail';
import { ShelfView } from './ShelfView';
import { ProgressView } from './ProgressView';
import { HelpView } from './HelpView';
import { DISCLAIMER, type MapTab } from './mapUtils';
import { getProfessionalCareContext } from '../../lib/professionalCareClient';
import { ProfessionalCareNote } from '../ProfessionalCareNote';
import { washScheduleNote, washFrequencyAssumption } from '../../lib/washFrequency';

const TABS: { id: MapTab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'shelf', label: 'My Shelf' },
  { id: 'progress', label: 'Progress' },
  { id: 'help', label: 'Help' },
];

export interface RoutineMapGuideProps {
  context: MapContext;
  progressStore?: ProgressStore;
  onBack?: () => void;
}

export function RoutineMapGuide({ context: inputContext, progressStore, onBack }: RoutineMapGuideProps) {
  const context = useMemo(() => getProfessionalCareContext(inputContext), [inputContext]);
  const planKey = useMemo(() => getPlanKey(context), [context]);
  const { progress, isLoading, isSaving, error, mode, firstName, reload, update } = useRoutineProgress(planKey, progressStore);
  const today = localDate();
  const startDate = progress?.startDate ?? today;
  const days = useMemo(() => buildRoutineCalendar(context, startDate), [context, startDate]);
  const phases = useMemo(() => getMapPhases(context), [context]);
  const [tab, setTab] = useState<MapTab>('today');
  const [editingDetails, setEditingDetails] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const canSave = !!progress && !isLoading && !isSaving;
  const needsSetup = !isLoading && !!progress && progress.revision === 0;
  const todayIndex = days.findIndex(d => d.date === today);
  const defaultDay = todayIndex >= 0 ? days[todayIndex].day : days[0] && today < days[0].date ? 1 : 30;
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const activeDay = days.find(d => d.day === (selectedDay ?? defaultDay)) ?? days[0];
  const stats = progress ? getProgressStats(progress, today) : null;

  const go = (t: MapTab) => {
    if (t === 'today') setSelectedDay(null);
    setTab(t);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const guardedUpdate = async (patch: Parameters<typeof update>[0]) => {
    setSaveError(null);
    const ok = await update(patch);
    if (!ok) setSaveError('We couldn’t save that change. Nothing you entered was lost—please try again.');
    return ok;
  };

  const toggleComplete = async (day: number) => {
    if (!progress) return false;
    const target = days.find(d => d.day === day);
    if (!target || target.date > today) return false;
    const set = new Set(progress.completedDays);
    if (set.has(day)) set.delete(day); else set.add(day);
    return guardedUpdate({ completedDays: [...set].sort((a, b) => a - b) });
  };

  const saveCheckIn = async (key: string, checkIn: CheckIn) => {
    if (!progress) return false;
    const target = days.find(d => d.day === checkIn.day);
    if (!target || target.date > today) return false;
    if (key !== 'baseline' && !progress.checkIns.baseline) return false;
    return guardedUpdate({ checkIns: { ...progress.checkIns, [key]: checkIn } });
  };

  const setup = (name: string, start: string) => guardedUpdate({ firstName: name, startDate: start }).then(ok => {
    if (ok) setEditingDetails(false);
    return ok;
  });

  const openDay = (day: number) => { setSelectedDay(day); go('calendar'); };
  const displayName = progress?.firstName || firstName;
  const currentPhase = phases.find(p => p.number === activeDay?.phase);
  const scheduleNote = washFrequencyAssumption(context.answers.shampooFrequency) ?? washScheduleNote(context.washFrequency);

  const navigation = (
      <nav className={`rm-nav ${context.hasSevereRedFlag ? '' : 'mt-12'}`} aria-label="Routine map">
        {context.hasSevereRedFlag && <div className="mx-auto max-w-4xl px-3 md:px-6"><ProfessionalCareNote /></div>}
        <div className="rm-nav-inner mx-auto max-w-4xl px-3 md:px-6">
          {TABS.map(t => (
            <button key={t.id} type="button" className="rm-tab" aria-current={tab === t.id ? 'page' : undefined} onClick={() => go(t.id)} data-testid={`map-tab-${t.id}`}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
  );
  return (
    <div className="rm min-h-[100dvh] pb-28" data-testid="routine-map-guide">
      {context.hasSevereRedFlag && navigation}
      <div className="mx-auto w-full max-w-4xl px-5 md:px-8">
        {onBack && (
          <button type="button" onClick={onBack} className="rm-focus mt-8 inline-flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-foreground/60 hover:text-foreground">
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <MapCover firstName={displayName} focus={context.focus} startDate={startDate} mode={mode} hasSevereRedFlag={context.hasSevereRedFlag} />
        <p className="rm-small mt-5" data-testid="map-wash-frequency">{scheduleNote}</p>
      </div>
      {!context.hasSevereRedFlag && navigation}

      <div ref={topRef} style={context.hasSevereRedFlag ? { scrollMarginTop: '19rem' } : undefined} className="mx-auto w-full max-w-4xl scroll-mt-16 px-5 pt-10 md:px-8">
        {isLoading && (
          <div className="space-y-4" aria-busy="true" aria-label="Loading your map">
            <div className="rm-skel h-6 w-40" /><div className="rm-skel h-10 w-3/4" /><div className="rm-skel h-40 w-full" />
          </div>
        )}
        {error && !progress && (
          <div className="rm-panel-blush mb-8 p-5 md:p-6" role="alert" data-testid="progress-load-error">
            <p className="text-sm font-medium">We couldn’t load your saved progress.</p>
            <p className="rm-small mt-1">You’re seeing a read-only calendar starting today. Your shelf and help remain available; saving is paused until it loads.</p>
            <button type="button" className="rm-btn rm-btn-line mt-4" onClick={() => void reload()}>Try again</button>
          </div>
        )}
        {error && progress && <div className="rm-panel-blush mb-8 p-5" role="alert">
          <p className="rm-small">{error} Your unsaved form entries are still on this page.</p>
          <button type="button" className="rm-btn rm-btn-line mt-3" onClick={() => {
            if (window.confirm('Reload the saved log? Unsaved form edits will be cleared. Copy any notes you want to keep first.')) void reload();
          }}>Reload saved log</button>
        </div>}
        {saveError && <p className="rm-panel-blush mb-6 p-4 text-sm" role="alert">{saveError}</p>}
        {isSaving && <p className="rm-small mb-4" role="status">Saving…</p>}

        {needsSetup && <MapSetup progress={null} defaultName={firstName} disabled={isSaving} onSubmit={setup} />}

        {!isLoading && tab === 'today' && activeDay && (
          <div className="space-y-14">
            {progress && stats && (
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="rm-kicker">{todayIndex >= 0 ? `Today is day ${days[todayIndex].day}` : today < days[0].date ? 'Your map hasn’t started yet' : 'Your 30 days are complete'}</p>
                  <p className="rm-serif mt-2 text-2xl">{stats.completed} of 30 days complete · {stats.streak}-day streak</p>
                </div>
                <button type="button" className="rm-link text-[0.68rem] uppercase tracking-[0.18em]" onClick={() => setEditingDetails(v => !v)} disabled={!canSave}>
                  Edit name or start date
                </button>
              </div>
            )}
            {editingDetails && progress && <MapSetup progress={progress} defaultName={firstName} disabled={!canSave} onSubmit={setup} onCancel={() => setEditingDetails(false)} />}
            {currentPhase && (
              <div className="rm-panel-sage p-6 md:p-8">
                <p className="rm-kicker">Phase {currentPhase.number} · Days {currentPhase.from}–{currentPhase.to}</p>
                <h2 className="rm-serif mt-2 text-3xl">{currentPhase.name}</h2>
                <p className="rm-body mt-2">{currentPhase.focus}</p>
                <p className="rm-small mt-2"><strong>Milestone:</strong> {currentPhase.milestone}</p>
              </div>
            )}
            <FounderNote hasSevereRedFlag={context.hasSevereRedFlag} />
            <DayDetail day={activeDay} today={today} context={context} progress={progress} canSave={canSave} onToggleComplete={toggleComplete} onSaveCheckIn={saveCheckIn} />
            <div>
              <p className="rm-kicker">Looking ahead</p>
              <ul className="mt-4 divide-y divide-foreground/10 border-y border-foreground/10">
                {phases.map(p => (
                  <li key={p.number} className="grid gap-1 py-4 md:grid-cols-[10rem_1fr]">
                    <span className="rm-kicker">Days {p.from}–{p.to}</span>
                    <span><span className="rm-serif text-xl">{p.name}</span><span className="rm-small block">{p.milestone}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!isLoading && tab === 'calendar' && (
          <div className="space-y-14">
            <CalendarView days={days} phases={phases} today={today} progress={progress} selected={activeDay?.day ?? 1} onSelect={setSelectedDay} scheduleNote={context.hasSevereRedFlag ? `${scheduleNote} These are planned dates, not instructions to push through symptoms. Skip a wash that is uncomfortable and follow professional advice instead.` : scheduleNote} />
            {activeDay && <div className="rm-rule pt-10"><DayDetail day={activeDay} today={today} context={context} progress={progress} canSave={canSave} onToggleComplete={toggleComplete} onSaveCheckIn={saveCheckIn} /></div>}
          </div>
        )}
        {tab === 'shelf' && <ShelfView context={context} />}
        {!isLoading && tab === 'progress' && <ProgressView context={context} progress={progress} today={today} onOpenDay={openDay} />}
        {tab === 'help' && <HelpView context={context} />}

        {tab !== 'help' && <p className="rm-small mt-16 border-t border-foreground/15 pt-6">{DISCLAIMER}</p>}
      </div>
    </div>
  );
}

export default RoutineMapGuide;
