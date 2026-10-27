import { useState } from "react";
import type { RoutineStep } from "../data/recommendations";
import {
    getRoutineDecision,
    type RoutineOutcome,
} from "../lib/routineDecisions";
import { BasedOnAnswers } from "./GuideNotes";

const OUTCOMES: { id: RoutineOutcome; label: string }[] = [
    { id: "comfortable", label: "Comfortable" },
    { id: "coated", label: "Coated or heavy" },
    { id: "dry", label: "Dry or tangled" },
    { id: "stiff", label: "Stiff or rough" },
    { id: "irritated", label: "Scalp irritated" },
];

const ROLE_ORDER = [
    "Cleanse",
    "Condition",
    "Treatment wash",
    "Leave-in care",
    "Scalp care",
    "Heat protection",
    "Style",
    "Finish",
    "Tools",
    "Water setup (optional)",
];

const ROLE_NOTES: Record<string, string> = {
    "Treatment wash":
        "Scheduled, not every wash. A mask may replace conditioner on its treatment day; follow the timing in your plan.",
    "Leave-in care":
        "Stays in after rinsing. Strength leave-ins are not interchangeable with a moisture leave-in.",
    "Scalp care":
        "Leave-on scalp step. Patch test first; not a substitute for anything else.",
    Tools: "Only for the styling you already do. Not needed to follow the routine.",
    "Water setup (optional)":
        "An optional setup choice, never a first purchase.",
};

function roleOf(step: RoutineStep): string {
    const c = step.product.category.toLowerCase();
    const id = step.product.id;
    if (id === "jolieFilteredShowerhead" || c.includes("water"))
        return "Water setup (optional)";
    if (c.includes("tool")) return "Tools";
    if (
        [
            "detoxScrub",
            "nounouMask",
            "oiMask",
            "nourishingHairBuildingPak",
        ].includes(id) ||
        c.includes("mask")
    )
        return "Treatment wash";
    if (c.includes("cleanse")) return "Cleanse";
    if (id === "replumpingSuperactive" || c.includes("leave-in"))
        return "Leave-in care";
    if (c.includes("conditioner")) return "Condition";
    if (id === "energizingSuperactive" || c.includes("scalp"))
        return "Scalp care";
    if (id === "meluShield" || c.includes("heat protectant"))
        return "Heat protection";
    if (c.includes("oil")) return "Finish";
    return "Style";
}

export function RoutineDecisionSupport({
    routine,
    hasSevereRedFlag,
    owner = false,
}: {
    routine: RoutineStep[];
    hasSevereRedFlag: boolean;
    owner?: boolean;
}) {
    const [outcome, setOutcome] = useState<RoutineOutcome | null>(null);
    if (hasSevereRedFlag) return null;
    const roles = ROLE_ORDER.map((role) => ({
        role,
        steps: routine.filter((step) => roleOf(step) === role),
    })).filter((r) => r.steps.length > 0);
    const decision = outcome ? getRoutineDecision(routine, outcome) : null;

    return (
        <section
            className="mt-16 border-t border-foreground/15 pt-16"
            aria-labelledby="decision-support-heading"
            data-testid="routine-decision-support"
        >
            <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                {owner
                    ? "After you wash"
                    : "Before you buy, and after you wash"}
            </span>
            <h2
                id="decision-support-heading"
                className="mt-3 scroll-mt-8 font-serif text-3xl"
            >
                Decide your next step
            </h2>
            <BasedOnAnswers className="mt-3" />

            <div className="mt-8 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
                <div
                    className="rounded-3xl border border-foreground/15 bg-paper p-6 md:p-8"
                    data-testid="use-what-you-own"
                >
                    <h3 className="font-serif text-2xl">
                        Use what you own, by role
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                        Not every role is a purchase. Start with your
                        first-purchase priority and add the rest only when you
                        need it. If you already own something for a role, check
                        its label before swapping: a similar name or the word
                        “treatment” doesn’t make products equivalent. Keep
                        protein, bond-building, and scalp actives exactly as
                        your plan lists them, and follow each product’s
                        directions.
                    </p>
                    <dl className="mt-5 divide-y divide-foreground/10 text-sm">
                        {roles.map(({ role, steps }) => (
                            <div
                                key={role}
                                className="grid grid-cols-[7.5rem_1fr] gap-3 py-2.5"
                            >
                                <dt className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/55 pt-0.5">
                                    {role}
                                </dt>
                                <dd className="text-foreground/85">
                                    {steps
                                        .map((s) => s.product.name)
                                        .join(", ")}
                                    {ROLE_NOTES[role] && (
                                        <span className="mt-0.5 block text-xs leading-relaxed text-foreground/60">
                                            {ROLE_NOTES[role]}
                                        </span>
                                    )}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <ul className="mt-5 space-y-2 text-sm leading-relaxed text-foreground/75">
                        <li>
                            <strong className="font-medium text-foreground">
                                Avoid duplicates:
                            </strong>{" "}
                            don’t buy a second product for a job your plan
                            already covers, such as another leave-in or another
                            repair mask.
                        </li>
                        <li>
                            <strong className="font-medium text-foreground">
                                One change at a time:
                            </strong>{" "}
                            add or swap a single product, then give it a few
                            washes before judging it.
                        </li>
                    </ul>
                </div>

                <div
                    className="rounded-3xl bg-blue/70 p-6 md:p-8"
                    data-testid="after-wash-helper"
                >
                    <h3 className="font-serif text-2xl">
                        After this wash, my hair feels
                    </h3>
                    <div
                        role="group"
                        aria-label="How your hair feels after washing"
                        className="mt-5 flex flex-wrap gap-2"
                    >
                        {OUTCOMES.map((o) => (
                            <button
                                key={o.id}
                                type="button"
                                aria-pressed={outcome === o.id}
                                onClick={() => setOutcome(o.id)}
                                className={`rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/60 ${outcome === o.id ? "border-foreground bg-foreground text-background" : "border-foreground/25 bg-paper/60 text-foreground/80 hover:border-foreground/50"}`}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>
                    <div aria-live="polite" className="mt-6 min-h-[7rem]">
                        {decision ? (
                            <div data-testid="after-wash-decision">
                                <h4 className="font-serif text-xl">
                                    {decision.title}
                                </h4>
                                <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                                    {decision.action}
                                </p>
                                <p className="mt-3 text-xs leading-relaxed text-foreground/70">
                                    <span className="font-medium uppercase tracking-widest">
                                        Next check:
                                    </span>{" "}
                                    {decision.nextCheck}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm leading-relaxed text-foreground/70">
                                Pick the closest match once your hair is dry.
                                You will get one change for your next wash,
                                using only your routine’s products.
                            </p>
                        )}
                    </div>
                    <p className="mt-4 text-xs leading-relaxed text-foreground/60">
                        Quiz-based guidance, not a diagnosis. If irritation
                        persists or worsens, stop the product and seek
                        professional care.
                    </p>
                </div>
            </div>
        </section>
    );
}
