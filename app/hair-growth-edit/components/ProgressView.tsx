import { Lock, ArrowLeft, Plus, CalendarDays, Camera, RefreshCcw } from 'lucide-react';

interface ProgressViewProps {
  onBack: () => void;
}

export function ProgressView({ onBack }: ProgressViewProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-32 pt-12 md:px-8 md:pt-20 slide-up" data-testid="section-progress">
      <button
        onClick={onBack}
        className="mb-12 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-widest text-foreground/60 transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} /> Return to Edit
      </button>

      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground/60">
            The Growth Edit / Locked
          </span>
          <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-5xl">
            My Progress
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-foreground/80">
            A structured journal to track length retention, routine consistency, and visual changes over time.
          </p>
        </div>
        <button
          disabled
          className="inline-flex cursor-not-allowed items-center gap-2 border border-foreground/15 bg-paper-dark px-5 py-3 text-[0.7rem] font-medium uppercase tracking-widest text-foreground/40 pill-cta"
        >
          <Plus size={14} /> New Entry
        </button>
      </div>

      <div className="mt-16 border-t border-foreground/15 pt-12">
        <div className="relative overflow-hidden border border-foreground/15 bg-paper-dark p-8 md:p-12">
          
          <div className="absolute right-0 top-0 h-full w-full bg-[linear-gradient(110deg,transparent_20%,hsl(var(--background)/0.4)_48%,transparent_74%)] bg-[length:220%_100%] animate-[sheen_3.6s_ease-in-out_infinite] opacity-50" />

          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-foreground/15 bg-paper text-foreground/40">
              <Lock size={20} />
            </div>
            <h2 className="mt-6 font-serif text-2xl text-foreground">
              Progress Tracking is Locked
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/70">
              Unlock the full Growth Edit to document your wash days, track length retention with photo evidence, and log product performance.
            </p>
          </div>

          <div className="relative z-10 mt-12 grid gap-6 opacity-30 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="panel-outline bg-paper p-6">
                <div className="flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-widest text-foreground/60">
                  <CalendarDays size={14} /> Oct 1{i}, 2024
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                  Wash day. Double cleansed and used the repair mask. Ends are feeling significantly more flexible when detangling.
                </p>
                <div className="mt-6 flex h-32 items-center justify-center border border-dashed border-foreground/20 bg-paper-dark text-foreground/40">
                  <Camera size={20} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}