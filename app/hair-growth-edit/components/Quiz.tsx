import { useState } from 'react';
import { QUESTIONS, Option } from '../data/questions';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface QuizProps {
  step: number;
  answers: Record<string, number>;
  onAnswer: (questionId: string, optionIndex: number) => void;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
}

const PatternIcon = ({ type }: { type: number }) => {
  switch (type) {
    case 0: // Straight
      return (
        <svg viewBox="0 0 40 40" className="h-6 w-6 stroke-foreground/70" fill="none" strokeWidth="1.5" strokeLinecap="round">
          <path d="M20 4 Q 21 20 20 36" />
        </svg>
      );
    case 1: // S-waves
      return (
        <svg viewBox="0 0 40 40" className="h-6 w-6 stroke-foreground/70" fill="none" strokeWidth="1.5" strokeLinecap="round">
          <path d="M20 4 C 32 12, 8 26, 20 36" />
        </svg>
      );
    case 2: // Loops or ringlets
      return (
        <svg viewBox="0 0 40 40" className="h-6 w-6 stroke-foreground/70" fill="none" strokeWidth="1.5" strokeLinecap="round">
          <path d="M20 4 C 36 12, 32 20, 20 20 C 8 20, 4 28, 20 36" />
        </svg>
      );
    case 3: // Tight coils or zigzags
      return (
        <svg viewBox="0 0 40 40" className="h-6 w-6 stroke-foreground/70" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 4 L 28 9 L 12 14 L 28 19 L 12 24 L 28 29 L 20 36" />
        </svg>
      );
    default:
      return null;
  }
};

export function Quiz({ step, answers, onAnswer, onNext, onBack, onComplete }: QuizProps) {
  const currentQuestion = QUESTIONS[step];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isLast = step === QUESTIONS.length - 1;
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  if (!currentQuestion) return null;

  const handleSelect = (index: number) => {
    onAnswer(currentQuestion.id, index);
  };

  const handleNext = () => {
    if (currentAnswer === undefined) return;
    if (isLast) onComplete();
    else onNext();
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-24 pt-12 md:px-8 md:pt-20 slide-up" data-testid="section-quiz">
      {/* Progress */}
      <div className="mb-14">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.15em] text-foreground/60">
            The Growth Edit / {String(step + 1).padStart(2, '0')}
          </span>
          <span className="text-[0.65rem] font-medium tracking-widest text-foreground/60">
            {step + 1} OF {QUESTIONS.length}
          </span>
        </div>
        <div className="h-[2px] w-full bg-foreground/10 rounded-full">
          <div 
            className="h-full bg-foreground rounded-full transition-[width] duration-500 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      {/* Question */}
      <div key={currentQuestion.id} className="fade-in">
        <h2 className="font-serif text-3xl leading-snug tracking-tight text-foreground md:text-5xl">
          {currentQuestion.prompt}
        </h2>

        {currentQuestion.preparation && (
          <div className="mt-8 border border-foreground/15 rounded-2xl bg-paper-dark px-6 py-7 md:px-8">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.15em] text-foreground/60">
              {currentQuestion.preparationTitle ?? 'How to prepare'}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              {currentQuestion.help}
            </p>
            <ol className="mt-5 space-y-3">
              {currentQuestion.preparation.map((instruction, index) => (
                <li key={index} className="grid grid-cols-[1.5rem_1fr] gap-3 text-sm leading-relaxed text-foreground/85">
                  <span className="font-support italic text-foreground/55">{index + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Options */}
        <div className="mt-12 space-y-3" role="radiogroup" aria-label={currentQuestion.prompt}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = currentAnswer === index;
            const hasIcon = currentQuestion.id === 'pattern' && index < 4;
            
            return (
              <button
                key={index}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelect(index)}
                className={`group flex w-full items-center justify-between border px-5 py-4 text-left transition-colors duration-200 md:px-6 md:py-5 rounded-2xl ${
                  isSelected 
                    ? 'border-foreground bg-foreground text-background' 
                    : 'border-foreground/15 bg-transparent hover:border-foreground/40'
                }`}
                data-testid={`option-${currentQuestion.id}-${index}`}
              >
                <div className="flex items-center gap-4">
                  {hasIcon && (
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-background/30 bg-background/10' : 'border-foreground/15 bg-paper-dark'}`}>
                      <PatternIcon type={index} />
                    </span>
                  )}
                  <span className="text-sm font-medium tracking-wide md:text-base">
                    {option.label}
                  </span>
                </div>
                {isSelected && (
                  <span className="text-[0.6rem] font-medium uppercase tracking-widest text-background/80">
                    Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-16 flex items-center justify-between border-t border-foreground/15 pt-8">
        <button
          type="button"
          onClick={onBack}
          disabled={step === 0}
          className="inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-widest text-foreground transition-opacity hover:opacity-70 disabled:pointer-events-none disabled:opacity-30"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={currentAnswer === undefined}
          className="pill-cta inline-flex items-center gap-3 bg-foreground px-6 py-3.5 text-[0.7rem] font-medium uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-30"
        >
          {isLast ? 'View Assessment' : 'Next'} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
