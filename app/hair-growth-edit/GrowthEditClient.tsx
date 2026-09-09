'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { QUESTIONS } from './data/questions';
import { calculateResults } from './lib/scoring';
import { Header } from './components/Header';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';
import { ProgressView } from './components/ProgressView';
import { canViewResults, resolveProgressReturnView, type AppView } from './lib/navigation';
import { useAuth } from '@/lib/auth/useAuth';
import {
  PENDING_ANSWERS_KEY,
  checkGrowthEditEntitlement,
  loadSavedAssessment,
  saveAssessment,
  type AnswerMap,
} from './lib/assessmentStore';

export default function GrowthEditClient() {
  const { signedIn, loading: authLoading } = useAuth();
  const [view, setView] = useState<AppView>('home');
  const [progressReturnView, setProgressReturnView] = useState<Exclude<AppView, 'progress'>>('home');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [unlocked, setUnlocked] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const didBootstrap = useRef(false);

  useEffect(() => {
    document.title = 'The Growth Edit — The Hair Insider';
  }, []);

  // Runs once auth state resolves: recovers a just-completed quiz that was
  // waiting on sign-in, or restores a previously saved assessment so a
  // returning, signed-in visitor lands straight on their results.
  useEffect(() => {
    if (authLoading || didBootstrap.current) return;
    didBootstrap.current = true;

    (async () => {
      if (!signedIn) {
        setBootstrapping(false);
        return;
      }

      const pendingRaw = sessionStorage.getItem(PENDING_ANSWERS_KEY);
      if (pendingRaw) {
        sessionStorage.removeItem(PENDING_ANSWERS_KEY);
        try {
          const pendingAnswers = JSON.parse(pendingRaw) as AnswerMap;
          await saveAssessment(pendingAnswers);
          setAnswers(pendingAnswers);
          setUnlocked(await checkGrowthEditEntitlement());
          setView('results');
          setBootstrapping(false);
          return;
        } catch {
          // fall through to the saved-assessment check below
        }
      }

      const [saved, entitled] = await Promise.all([
        loadSavedAssessment(),
        checkGrowthEditEntitlement(),
      ]);
      setUnlocked(entitled);
      if (saved) {
        setAnswers(saved);
        setView('results');
      }
      setBootstrapping(false);
    })();
  }, [authLoading, signedIn]);

  const assessmentComplete = QUESTIONS.every(question => answers[question.id] !== undefined);
  const resultsAllowed = canViewResults(answers, QUESTIONS.map(question => question.id), signedIn);

  // Derived, not stored: if `view` claims 'results' but the visitor no
  // longer qualifies (e.g. signed out), fall back without a setState-in-effect.
  const effectiveView: AppView =
    view === 'results' && !resultsAllowed ? (assessmentComplete ? 'auth' : 'quiz') : view;

  const openProgress = () => {
    if (view !== 'progress') setProgressReturnView(view);
    setView('progress');
  };

  const handleStart = () => {
    setStep(0);
    setAnswers({});
    setView('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizAnswer = (qId: string, optIdx: number) => {
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleQuizNext = () => {
    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizBack = () => {
    setStep(prev => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizComplete = async () => {
    if (signedIn) {
      await saveAssessment(answers);
      setUnlocked(await checkGrowthEditEntitlement());
      setView('results');
    } else {
      sessionStorage.setItem(PENDING_ANSWERS_KEY, JSON.stringify(answers));
      setView('auth');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const results = calculateResults(answers);

  if (bootstrapping) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-paper text-foreground/60">
        <p className="text-xs font-medium uppercase tracking-widest">Loading your assessment…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-paper text-foreground">
      <Header onProgressClick={openProgress} />

      {effectiveView === 'home' && (
        <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-12 md:pt-20 slide-up">
          <div className="grid gap-12 md:grid-cols-[1.15fr_0.85fr] md:items-center md:gap-16">
            <div className="order-2 md:order-1">
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground/60">
                Diagnostic Assessment
              </span>
              <h1 className="mt-4 font-serif text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl">
                The Growth Edit
              </h1>
              <div className="mt-6 h-px w-12 bg-foreground/30" />
              <p className="mt-6 max-w-md text-sm leading-relaxed text-foreground/80 md:text-base">
                A private, 25-question diagnostic for women struggling to retain length.
                Identify the root cause of your length stall, establish a foundational routine,
                and receive clear instructions on what habits to stop immediately.
              </p>

              <div className="mt-10">
                <button
                  onClick={handleStart}
                  className="inline-flex w-full items-center justify-center gap-4 bg-sage px-8 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-foreground transition-opacity hover:opacity-90 sm:w-auto pill-cta"
                >
                  Begin Assessment <ArrowRight size={14} />
                </button>
              </div>

              <div className="mt-12 border-t border-foreground/15 pt-6">
                <p className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                  Before you begin
                </p>
                <ul className="mt-3 space-y-1 text-xs text-foreground/70">
                  <li>— Answer honestly based on your actual routine.</li>
                  <li>— The assessment takes approximately 3 minutes.</li>
                  <li>— You will receive immediate foundational guidance.</li>
                </ul>
              </div>
            </div>

            <div className="order-1 flex items-center justify-center md:order-2">
              <div className="panel-outline w-full max-w-[260px] overflow-hidden bg-paper-dark p-2 md:max-w-[340px] rounded-2xl">
                <img
                  src="/braided_pony_double_bow.jpeg"
                  alt="Editorial back view of blonde braided ponytail with ribbon"
                  className="aspect-[4/5] w-full object-cover rounded-xl grayscale-[0.2] contrast-[0.9]"
                />
              </div>
            </div>
          </div>
        </main>
      )}

      {effectiveView === 'quiz' && (
        <Quiz
          step={step}
          answers={answers}
          onAnswer={handleQuizAnswer}
          onNext={handleQuizNext}
          onBack={handleQuizBack}
          onComplete={handleQuizComplete}
        />
      )}

      {effectiveView === 'auth' && (
        <main className="mx-auto w-full max-w-2xl px-6 pb-24 pt-16 md:pt-24 slide-up text-center">
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground/60">
            Assessment Complete
          </span>
          <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-5xl">
            Save Your Results
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-foreground/80">
            Create an account or sign in to view your primary damage pattern, immediate edit, and
            two foundation products. Your results are saved so you can return to them anytime.
          </p>

          <a
            href={`/signin?next=${encodeURIComponent('/hair-growth-edit')}`}
            className="mx-auto mt-10 inline-flex w-full max-w-md items-center justify-center gap-3 bg-foreground px-6 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-background transition-opacity hover:opacity-90 pill-cta"
          >
            Continue to Sign In <ArrowRight size={14} />
          </a>
        </main>
      )}

      {effectiveView === 'results' && resultsAllowed && (
        <Results
          {...results}
          unlocked={unlocked}
          onReset={() => {
            setView('home');
            setAnswers({});
            setStep(0);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenProgress={openProgress}
        />
      )}

      {effectiveView === 'progress' && (
        <ProgressView
          onBack={() => setView(resolveProgressReturnView(progressReturnView, assessmentComplete, resultsAllowed))}
        />
      )}

      <footer className="border-t border-foreground/15 bg-paper py-10 px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground/80">
              The Hair Insider
            </span>
            <p className="mt-1 font-support text-xs italic text-foreground/60">
              Learn it. Then live it.
            </p>
          </div>
          <p className="max-w-md text-center text-[0.65rem] uppercase tracking-wide text-foreground/50 md:text-right">
            The Growth Edit is educational guidance, not medical advice. If experiencing concerning shedding or scalp issues, consult a professional.
          </p>
        </div>
      </footer>
    </div>
  );
}
