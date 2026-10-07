import { useState, useEffect, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import type { ProductRecommendation, RoutineStep } from '../data/recommendations';
import { ProductShelf } from './ProductShelf';
import { StarterPair } from './StarterPair';
import { getFirstPurchaseReason, getRoutineSummary, getStarterPair } from '../lib/guideSummary';

interface GuideViewProps {
  paidRoutine: RoutineStep[];
  shouldShampooTwice: boolean;
  primaryCause: string;
  behaviorToStop: string;
  observations: string[];
  supportingNeeds: string[];
  washFrequency: 'daily' | 'severalWeekly' | 'weekly' | 'lessWeekly';
  stylePreference: 'natural' | 'blowout' | 'straightened' | 'curled' | 'protective';
  reportedDensityChange: boolean;
  firstRecommendation: ProductRecommendation | null;
  secondRecommendation: ProductRecommendation | null;
  hasSevereRedFlag: boolean;
}

const DAILY_TIPS = [
  "Sleep on a silk or satin pillowcase to reduce overnight friction.",
  "Always detangle starting from the ends and carefully working your way up.",
  "Avoid tight hairstyles that put constant tension on your edges.",
  "Let your hair air dry partially before using a blow dryer to minimize heat exposure.",
  "Apply heat protectant every single time before using hot tools.",
  "Find a cleansing rhythm your scalp tolerates; seek professional advice if irritation persists.",
  "Consider trimming visibly split ends to limit further wear along the strand.",
  "Massage your scalp gently when washing instead of scrubbing with your nails.",
  "Ensure your hair is thoroughly wet before applying shampoo to help it lather evenly."
];

export function GuideView({ 
  paidRoutine, 
  shouldShampooTwice,
  primaryCause,
  behaviorToStop,
  observations = [],
  supportingNeeds = [],
  washFrequency,
  stylePreference,
  reportedDensityChange,
  firstRecommendation,
  secondRecommendation,
  hasSevereRedFlag,
}: GuideViewProps) {
  const [savedProducts, setSavedProducts] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('growthEditSavedProducts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('growthEditSavedProducts', JSON.stringify(savedProducts));
    } catch {
      // Saving is an enhancement; storage restrictions should not break the guide.
    }
  }, [savedProducts]);

  const toggleSave = (id: string) => {
    setSavedProducts(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const dailyTip = useMemo(() => {
    const dayIndex = Math.floor(Date.now() / 86400000);
    return DAILY_TIPS[dayIndex % DAILY_TIPS.length];
  }, []);


  const hasProtein = paidRoutine.some(step => step.product.id === 'nourishingHairBuildingPak');
  const hasScrub = paidRoutine.some(step => step.product.id === 'detoxScrub');
  const shampooStep = paidRoutine.find(step => step.product.category.toLowerCase().includes('cleanse'));
  const treatmentSteps = paidRoutine.filter(step =>
    ['detoxScrub', 'oiMask', 'nounouMask', 'nourishingHairBuildingPak'].includes(step.product.id),
  );
  const washRhythm = {
    daily: 'Most days, based on your current washing pattern',
    severalWeekly: 'Two to three wash days each week',
    weekly: 'One main wash day each week',
    lessWeekly: 'One wash day every one to two weeks',
  }[washFrequency];
  const styleLabel = {
    natural: 'your natural texture',
    blowout: 'your usual blowout',
    straightened: 'your straightened finish',
    curled: 'your curled or waved finish',
    protective: 'your protective style',
  }[stylePreference];
  const firstPurchase = !hasSevereRedFlag
    ? paidRoutine.find(step => step.product.id === firstRecommendation?.id)?.product
    : undefined;
  const firstPurchaseReason = firstPurchase ? getFirstPurchaseReason(firstPurchase) : '';
  const starterPair = hasSevereRedFlag ? [] : getStarterPair(paidRoutine, firstRecommendation, secondRecommendation);
  

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-32 pt-12 md:px-8 md:pt-20 slide-up" data-testid="section-guide">
      {/* Guide Header */}
      <div className="max-w-3xl">
        <div className="rounded-2xl border border-foreground/15 bg-sage/25 p-5 md:p-6" data-testid="routine-at-a-glance">
          <p className="text-sm leading-relaxed text-foreground md:text-base">
            {getRoutineSummary(washFrequency, paidRoutine)}
          </p>
        </div>
        {firstPurchase && (
          <p className="mt-4 text-sm leading-relaxed text-foreground/85 md:text-base" data-testid="first-purchase-priority">
            If you only buy one first, start with <strong className="font-medium text-foreground">{firstPurchase.name}</strong>
            {firstPurchaseReason ? ` because ${firstPurchaseReason}.` : `. ${firstPurchase.reason}`}
          </p>
        )}
        {hasSevereRedFlag && (
          <p className="mt-4 text-sm leading-relaxed text-foreground/85" data-testid="professional-care-priority">
            Before buying anything new, have the change you reported assessed by a qualified healthcare professional. Products are not a substitute for that care.
          </p>
        )}
        <span className="mt-10 block text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground/60">
          Your Routine Guide
        </span>
        <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
          The Complete Growth Edit
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-foreground/80 md:text-base">
          This guide is based on your quiz answers, not an in-person assessment. It explains what to use, in what order, and how often. Start with the suggestions below, then adjust as you notice how your hair and scalp feel.
        </p>
      </div>

      {/* Daily Tip */}
      <div className="mt-16 rounded-2xl border border-foreground/15 bg-paper p-6 md:p-8" data-testid="daily-tip">
        <div className="flex items-center gap-3">
          <Calendar className="text-sage" size={20} />
          <h2 className="font-serif text-xl">Length-Retention Tip</h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-foreground/80">{dailyTip}</p>
      </div>

      {/* Personalized Action Plan */}
      <div className="mt-16 border-t border-foreground/15 pt-16" data-testid="action-plan">
        <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
          How to follow your results
        </span>
        <h2 className="mt-3 font-serif text-3xl text-foreground md:text-4xl">
          Your Action Plan
        </h2>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-foreground/75 md:text-base">
          Based on what you shared, start with <strong className="font-medium text-foreground">{primaryCause}</strong>. You do not need to add everything at once. Pay attention to <strong className="font-medium text-foreground">{behaviorToStop}</strong>, keep your wash routine consistent, and notice what changes.
        </p>

        <div className="mt-10 rounded-3xl border border-foreground/15 bg-paper-dark p-6 md:p-10">
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
            Why these suggestions
          </span>
          <div className="mt-6 grid gap-6 md:grid-cols-[0.85fr_1.15fr] md:gap-12">
            <div>
              <h3 className="font-serif text-2xl">What you reported</h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                {primaryCause === 'length protection (no dominant damage pattern)'
                  ? 'Your answers did not point to one clear pattern of damage. Start with gentle handling. The quiz cannot confirm whether your hair is healthy or damaged.'
                  : <>You mentioned {observations.length > 1 ? `${observations[0]} and ${observations[1]}` : observations[0] || 'the concerns in your quiz answers'}. That helped us choose these suggestions, but it does not tell us the medical cause.</>}
              </p>
            </div>
            <div>
              <h3 className="font-serif text-2xl">What to work on</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/80">
                <li><strong className="font-medium text-foreground">Keep your scalp clean:</strong> Wash away oil and product buildup before conditioning and styling.</li>
                <li><strong className="font-medium text-foreground">Be gentle with your hair:</strong> Detangle without pulling, limit repeated heat, and avoid rubbing or tugging at your ends.</li>
                <li><strong className="font-medium text-foreground">Change one thing at a time:</strong> Add new steps slowly so you can tell what helps and what does not agree with your hair or scalp.</li>
              </ul>
              {supportingNeeds.length > 0 && (
                <div className="mt-5 border-t border-foreground/15 pt-5">
                  {supportingNeeds.map(need => (
                    <p key={need} className="text-sm leading-relaxed text-foreground/75">{need}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
            How often to use each step
          </span>
          <h3 className="mt-3 font-serif text-3xl">Planning your wash days</h3>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/75">
            Start with <strong className="font-medium text-foreground">{washRhythm.toLowerCase()}</strong>. You can adjust this as needed. Each product card shows how often to use that step.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-foreground/15 bg-paper p-6">
              <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">Wash day</span>
              <h4 className="mt-3 font-serif text-xl">Cleanse and condition</h4>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                {shampooStep?.timing || 'Every wash day'}. Cleanse the scalp, condition the lengths, detangle gently, then apply leave-in before styling.
              </p>
            </div>
            <div className="rounded-2xl border border-foreground/15 bg-paper p-6">
              <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">Treatment wash</span>
              <h4 className="mt-3 font-serif text-xl">Use the scheduled treatment</h4>
              {treatmentSteps.length > 0 ? (
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/75">
                  {treatmentSteps.map(step => (
                    <p key={step.product.id}>
                      <strong className="font-medium text-foreground">{step.product.name}:</strong> {step.timing}.
                    </p>
                  ))}
                  <p>A treatment takes the place of the regular step that does the same job. Do not use both in the same wash.</p>
                </div>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                  Keep the wash simple. Do not add a separate scrub or protein treatment unless your results change.
                </p>
              )}
            </div>
            <div className="rounded-2xl border border-foreground/15 bg-paper p-6">
              <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">Between washes</span>
              <h4 className="mt-3 font-serif text-xl">Keep it simple</h4>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                Maintain {styleLabel} without adding more product to your roots. If your ends feel rough, try a small amount of oil. If you choose to use the scalp serum, follow the timing on its card.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-foreground/15 bg-paper p-6 md:p-8">
          <h3 className="font-serif text-2xl">Your first-wash checklist</h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/75">The product cards below explain where each product goes and how often to use it.</p>
          <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground/80">
            <li>Cleanse your scalp with {shampooStep?.product.name ?? 'your listed cleanser'} using the wash method below.</li>
            <li>Condition the lengths, detangle gently, then apply the listed leave-in before styling.</li>
            <li>Check whether a treatment is due. If it is, use it instead of the regular step it replaces, not alongside it.</li>
            <li>Notice how your scalp and ends feel afterward before changing another step.</li>
          </ol>
        </div>

        <div className="mt-12 rounded-3xl bg-sage/25 p-6 md:p-10">
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
            Introduce the routine gradually
          </span>
          <h3 className="mt-3 font-serif text-3xl">Your first 30 days</h3>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div>
              <p className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">Days 1–7</p>
              <h4 className="mt-2 font-serif text-xl">Start with the basics</h4>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">Start with shampoo, conditioner, leave-in, and the habit change above. Take a photo of your ends. Make a quick note of how your scalp feels and how much shedding, tangling, or breakage you notice when washing.</p>
            </div>
            <div>
              <p className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">Days 8–14</p>
              <h4 className="mt-2 font-serif text-xl">Try one new step</h4>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">If the basics are working for you, try your mask or treatment when it is due. The scalp serum is optional. Patch test any leave-on scalp product first, and stop using it if your scalp becomes irritated.</p>
            </div>
            <div>
              <p className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">Days 15–30</p>
              <h4 className="mt-2 font-serif text-xl">Find the right amount</h4>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">Add styling and finishing products only as needed. Adjust the amount before changing the product: use less if hair feels coated, and add a little more only when lengths still feel rough.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div>
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
              How to judge progress
            </span>
            <h3 className="mt-3 font-serif text-3xl">Your checkpoints</h3>
            <div className="mt-6 space-y-5">
              <div className="border-l border-foreground/25 pl-5">
                <h4 className="font-medium text-foreground">After 2 weeks</h4>
                <p className="mt-1 text-sm leading-relaxed text-foreground/75">Look for easier detangling, a comfortable scalp, less coating, and fewer snapped pieces during handling—not dramatic length change.</p>
              </div>
              <div className="border-l border-foreground/25 pl-5">
                <h4 className="font-medium text-foreground">After 4–6 weeks</h4>
                <p className="mt-1 text-sm leading-relaxed text-foreground/75">Look back at your first notes. Is detangling easier? Do your ends feel different? Are you seeing less breakage, or does your style last longer?</p>
              </div>
              <div className="border-l border-foreground/25 pl-5">
                <h4 className="font-medium text-foreground">After 8–12 weeks</h4>
                <p className="mt-1 text-sm leading-relaxed text-foreground/75">Compare photos with your hair styled the same way and in similar lighting. Fuller-looking ends and less breakage may mean you are keeping more of your length—not that your hair is growing faster.</p>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
              Adjust without guessing
            </span>
            <h3 className="mt-3 font-serif text-3xl">Troubleshooting</h3>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/75">
              <p><strong className="font-medium text-foreground">Hair feels coated or limp:</strong> Try less leave-in, styling product, and oil first. If buildup remains, follow the shampoo timing in this guide rather than adding another treatment.</p>
              <p><strong className="font-medium text-foreground">Ends still feel dry:</strong> Confirm conditioner is reaching every section, detangle while it has slip, and apply leave-in to damp lengths before increasing oil.</p>
              <p><strong className="font-medium text-foreground">Hair feels hard or unusually brittle:</strong> Pause protein-containing treatments and avoid adding strength products until flexibility returns.</p>
              <p><strong className="font-medium text-foreground">Scalp stings, burns, or stays irritated:</strong> Stop the newest scalp product, rinse thoroughly, and seek professional guidance if symptoms persist or worsen.</p>
              <p><strong className="font-medium text-foreground">Breakage is unchanged:</strong> Before buying another product, look at how you detangle, how tightly you style, how much heat you use, and whether your hair rubs against bedding at night. Products cannot make up for repeated pulling or rough handling.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Guidance Section */}
      <div className="mt-16 border-t border-foreground/15 pt-16">
        <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
          Using your guide
        </span>
        <h2 className="mt-3 font-serif text-3xl text-foreground">
          What to use—and what to skip
        </h2>
        
        <div className="mt-10">
          {/* What to skip */}
          <div className="mt-12 rounded-3xl border border-foreground/15 bg-sage/25 px-6 py-8 md:grid md:grid-cols-[11rem_1fr] md:gap-10 md:px-10 md:py-10">
            <div>
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
                Protect your budget
              </span>
              <h3 className="mt-2 font-serif text-2xl">What to skip</h3>
            </div>
            <div>
              <p className="mt-5 text-sm leading-relaxed text-foreground/80 md:mt-0">
                Before buying anything extra, check whether you already have a product that does the same job:
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/80">
                <li><strong className="font-medium text-foreground">Extra styling creams:</strong> Do not add another cream unless it replaces the styling step already listed below.</li>
                {!hasScrub && <li><strong className="font-medium text-foreground">Harsh clarifying scrubs:</strong> Your answers do not suggest a need for aggressive exfoliation.</li>}
                {!hasProtein && <li><strong className="font-medium text-foreground">Heavy protein treatments:</strong> Your answers do not suggest adding a separate high-protein treatment.</li>}
                <li><strong className="font-medium text-foreground">Duplicate treatments:</strong> You do not need several products that do the same thing. Choose one and see how your hair responds.</li>
              </ul>
            </div>
          </div>

          {/* What not to combine */}
          <div className="mt-6 rounded-3xl border border-foreground/15 bg-blue/70 px-6 py-8 md:grid md:grid-cols-[11rem_1fr] md:gap-10 md:px-10 md:py-10">
            <div>
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
                Avoid overlap
              </span>
              <h3 className="mt-2 font-serif text-2xl">What not to combine</h3>
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-foreground/80 md:mt-0">
              {hasProtein && <li><strong className="font-medium text-foreground">Protein with more protein:</strong> Do not stack keratin leave-ins or protein stylers with your NOURISHING Hair Building Pak.</li>}
              {hasScrub && <li><strong className="font-medium text-foreground">Scrub with regular shampoo:</strong> The detox scrub replaces shampoo on its scheduled treatment day; do not use both cleansers in the same wash.</li>}
              <li><strong className="font-medium text-foreground">High heat after a chemical treatment:</strong> Avoid intense hot-tool styling right after coloring, bleaching, or another chemical treatment.</li>
              <li><strong className="font-medium text-foreground">Using treatments too often:</strong> Follow the timing on each product card. Using more does not make hair grow faster.</li>
            </ul>
          </div>

          {/* Cleansing Instructions */}
          <div className="mt-6 rounded-3xl border border-foreground/15 bg-paper-dark px-6 py-8 md:grid md:grid-cols-[11rem_1fr] md:gap-10 md:px-10 md:py-10">
            <div>
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
                Your wash method
              </span>
              <h3 className="mt-2 font-serif text-2xl">Cleansing instructions</h3>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-foreground/80 md:mt-0">
              {shouldShampooTwice 
                ? "Shampoo twice, gently. The first wash loosens oil and product buildup; the second helps wash away what remains. Focus on your scalp both times and rinse well between washes."
                : "Shampoo once, gently. Work the lather into your scalp and let it rinse through the rest of your hair. You do not need to scrub your ends."}
            </p>
          </div>
        </div>
      </div>

      <StarterPair steps={starterPair} />
      <ProductShelf
        paidRoutine={paidRoutine}
        savedProducts={savedProducts}
        showSavedOnly={showSavedOnly}
        onToggleSaved={() => setShowSavedOnly(v => !v)}
        onToggleSave={toggleSave}
        reportedDensityChange={reportedDensityChange}
      />

    </div>
  );
}
