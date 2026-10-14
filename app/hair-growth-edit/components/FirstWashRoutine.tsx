import type { FirstWashPlan } from "../lib/firstWash";
import { BasedOnAnswers } from "./GuideNotes";
import { ROUTINE_OFFER } from "../lib/routineOffer";

export function FirstWashRoutine({ plan }: { plan: FirstWashPlan }) {
    return (
        <div className="mt-10 space-y-10" data-testid="first-wash-routine">
            <section
                id="routine-plan"
                className="scroll-mt-8 border-t border-foreground/15 pt-8"
            >
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
                    Your first wash
                </p>
                <h3 className="mt-3 font-serif text-3xl">
                    A step-by-step routine
                </h3>
                <BasedOnAnswers className="mt-3" />
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/75">
                    Having the right products is one part. Knowing how to use
                    them together is the part we don’t want you left guessing
                    about. This first wash is built based on the answers you
                    just gave. We’ll walk you through where each product goes,
                    how long to leave it, and what comes next. Take your time;
                    you don’t have to get every movement perfect.
                </p>
                <p className="mt-2 max-w-2xl text-xs leading-relaxed text-foreground/65">
                    Before you start, complete any patch tests your product
                    labels call for. Keep those labels nearby for the exact
                    amounts and directions.
                </p>
                <ol className="mt-6 list-decimal space-y-5 pl-5 marker:text-foreground/50">
                    {plan.steps.map((step) => (
                        <li key={step.title} className="pl-2">
                            <h4 className="text-sm font-medium text-foreground">
                                {step.title}
                            </h4>
                            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-foreground/75">
                                {step.detail}
                            </p>
                        </li>
                    ))}
                </ol>
                {plan.keratin && (
                    <aside
                        className="mt-6 rounded-2xl border border-foreground/15 bg-sage/25 p-5"
                        data-testid="keratin-first-use"
                    >
                        <h4 className="font-serif text-xl">
                            Use it this first time—then let your hair respond
                        </h4>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">
                            {plan.keratin.name}: {plan.keratin.timing}.
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                            {plan.keratin.explanation}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-foreground/65">
                            The pause is part of your routine, not a missed
                            step. We’re starting cautiously based on your
                            answers; they can’t confirm a protein need. Follow
                            the current product label, and don’t repeat a
                            treatment that leaves your hair or scalp feeling
                            worse.
                        </p>
                    </aside>
                )}
                <p className="mt-6 max-w-2xl text-sm leading-relaxed text-foreground/75">
                    Once your hair is dry, notice how your ends feel, how easily
                    it detangles, and whether your scalp feels comfortable.
                    You’re not looking for a dramatic change after one wash—just
                    learning how your hair responds. If something feels off, use
                    the troubleshooting section before adding more product.
                </p>
            </section>
            <section
                id="product-layering"
                className="scroll-mt-8 border-t border-foreground/15 pt-8"
                data-testid="product-layering"
            >
                <h3 className="font-serif text-3xl">
                    {ROUTINE_OFFER.layeringHeading}
                </h3>
                <BasedOnAnswers className="mt-3" />
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/75">
                    You don’t need to memorize this. Come back to the order
                    below whenever you wash, and keep scalp care separate from
                    the products for your lengths.
                </p>
                <dl className="mt-6 space-y-5">
                    {plan.layers.map((layer) => (
                        <div key={layer.title}>
                            <dt className="text-sm font-medium text-foreground">
                                {layer.title}
                            </dt>
                            <dd className="mt-1 max-w-3xl text-sm leading-relaxed text-foreground/75">
                                {layer.detail}
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>
        </div>
    );
}
