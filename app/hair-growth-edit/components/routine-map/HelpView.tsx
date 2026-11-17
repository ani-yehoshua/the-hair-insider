import type { MapContext } from '../../lib/routineMapTypes';
import { RoutineDecisionSupport } from '../RoutineDecisionSupport';
import { WaterQualitySection } from '../WaterQualitySection';
import { ScalpSerumSection } from '../ScalpSerumSection';
import { DISCLAIMER } from './mapUtils';

export function HelpView({ context }: { context: MapContext }) {
  const hasFilter = context.routine.some(s => s.product.id === 'jolieFilteredShowerhead');
  const hasSerum = context.routine.some(s => s.product.id === 'energizingSuperactive');
  return (
    <section aria-labelledby="rm-help-h" data-testid="routine-map-help">
      <p className="rm-kicker">When you’re unsure</p>
      <h2 id="rm-help-h" className="rm-serif mt-2 text-3xl md:text-4xl">Help</h2>

      <div className="mt-8 grid gap-5 md:grid-cols-[1.2fr_1fr]">
        <div className="rm-panel p-6 md:p-8">
          <p className="rm-kicker">General guidance</p>
          <h3 className="rm-serif mt-2 text-2xl">{context.hasSevereRedFlag ? 'Professional advice comes first' : 'Give it the month'}</h3>
          <p className="rm-body mt-3">{context.hasSevereRedFlag ? 'This calendar is for comfortable interim hair care, not a course of treatment. Do not wait 30 days to seek professional assessment. Follow their advice even when it changes the wash dates or products here.' : 'Follow the routine for up to 30 days so you can judge it on consistency. That is time to read comfort and handling—not a promise of growth.'}</p>
          <p className="rm-body mt-3">Optional items stay optional. You never have to buy them to follow this map.</p>
          <p className="rm-small mt-3">{context.hasSevereRedFlag ? 'No scalp serum, scrub, protein/repair treatment or toning wash is scheduled. Skip a step that irritates your scalp; extra products are not the next step for worsening symptoms.' : 'Your dates are a planned rhythm. If you miss a wash, do not squeeze in a treatment to catch up. Count the washes you actually did, keep the skipped-wash spacing for protein, and use your regular conditioner until the next treatment is due.'}</p>
        </div>
        <div className="rm-panel-blush p-6 md:p-8" data-testid="safety-guidance">
          <p className="rm-kicker">Stop early if</p>
          <ul className="rm-small mt-3 space-y-2">
            <li>Stop a product you suspect right away for burning, rash, worsening irritation, or stiffness that doesn’t ease.</li>
            <li>See a qualified professional for shedding that concerns you, scalp pain, or sores.</li>
            <li>Get urgent care for a severe reaction, swelling, or difficulty breathing.</li>
          </ul>
        </div>
      </div>

      <RoutineDecisionSupport routine={context.routine} hasSevereRedFlag={!!context.hasSevereRedFlag} owner={true} />
      {hasFilter && <WaterQualitySection />}
      {hasSerum && <ScalpSerumSection reportedDensityChange={context.reportedDensityChange} />}

      <p className="rm-small mt-12 border-t border-foreground/15 pt-6" data-testid="routine-map-disclaimer">{DISCLAIMER}</p>
    </section>
  );
}
