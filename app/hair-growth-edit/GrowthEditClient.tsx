'use client';

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { QUESTIONS } from './data/questions';
import { calculateResults } from './lib/scoring';
import { Header } from './components/Header';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';
import { ProgressView } from './components/ProgressView';
import { canViewResults, resolveProgressReturnView, type AppView } from './lib/navigation';

export default function GrowthEditClient() {
  const [view, setView] = useState<AppView>('home');
  const [progressReturnView, setProgressReturnView] = useState<Exclude<AppView, 'progress'>>('home');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [email, setEmail] = useState('');
  const [emailUnlocked, setEmailUnlocked] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    document.title = 'The Growth Edit — The Hair Insider';
  }, []);

  const assessmentComplete = QUESTIONS.every(question => answers[question.id] !== undefined);
  const resultsAllowed = canViewResults(answers, QUESTIONS.map(question => question.id), emailUnlocked);

  useEffect(() => {
    if (view === 'results' && !resultsAllowed) {
      setView(assessmentComplete ? 'email' : 'quiz');
    }
  }, [assessmentComplete, resultsAllowed, view]);

  const openProgress = () => {
    if (view !== 'progress') setProgressReturnView(view);
    setView('progress');
  };

  const handleStart = () => {
    setStep(0);
    setAnswers({});
    setEmailUnlocked(false);
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

  const handleQuizComplete = () => {
    setView('email');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setEmailUnlocked(true);
    setView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const results = calculateResults(answers);

  return (
    <div className="min-h-[100dvh] bg-paper text-foreground">
      <Header onProgressClick={openProgress} />

      {view === 'home' && (
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
                  src="/thi-braided-pony.jpeg" 
                  alt="Editorial back view of blonde braided ponytail with ribbon" 
                  className="aspect-[4/5] w-full object-cover rounded-xl grayscale-[0.2] contrast-[0.9]"
                />
              </div>
            </div>
          </div>
        </main>
      )}

      {view === 'quiz' && (
        <Quiz
          step={step}
          answers={answers}
          onAnswer={handleQuizAnswer}
          onNext={handleQuizNext}
          onBack={handleQuizBack}
          onComplete={handleQuizComplete}
        />
      )}

      {view === 'email' && (
        <main className="mx-auto w-full max-w-2xl px-6 pb-24 pt-16 md:pt-24 slide-up text-center">
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground/60">
            Assessment Complete
          </span>
          <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-5xl">
            View Your Results
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-foreground/80">
            Enter your email to view your primary damage pattern, immediate edit, and two foundation products.
            Your progress will be saved to this address.
          </p>

          <form onSubmit={handleEmailSubmit} className="mx-auto mt-10 max-w-md text-left panel-outline bg-paper px-6 py-8 rounded-2xl">
            <label htmlFor="email" className="block text-[0.65rem] font-medium uppercase tracking-widest text-foreground/70">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border-b border-foreground/30 bg-transparent py-3 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-foreground"
              placeholder="Enter your email"
              autoFocus
            />
            {emailError && (
              <p className="mt-2 text-[0.65rem] uppercase tracking-wide text-red-700/80">
                {emailError}
              </p>
            )}
            <button
              type="submit"
              className="mt-8 inline-flex w-full items-center justify-center gap-3 bg-foreground px-6 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-background transition-opacity hover:opacity-90 pill-cta"
            >
              Unlock Assessment <ArrowRight size={14} />
            </button>
          </form>
        </main>
      )}

      {view === 'results' && resultsAllowed && (
        <Results
          {...results}
          onReset={() => {
            setView('home');
            setAnswers({});
            setStep(0);
            setEmail('');
            setEmailUnlocked(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenProgress={openProgress}
        />
      )}

      {view === 'progress' && (
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