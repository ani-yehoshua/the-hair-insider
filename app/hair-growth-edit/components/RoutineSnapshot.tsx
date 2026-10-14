import type { HairProfile, RoutineStep } from "../data/recommendations";
import { getRoutineSnapshot } from "../lib/guideSummary";
import { BasedOnAnswers, GuideFitNote } from "./GuideNotes";

export function RoutineSnapshot({
    routine,
    washFrequency,
    hasSevereRedFlag,
}: {
    routine: RoutineStep[];
    washFrequency: HairProfile["washFrequency"];
    hasSevereRedFlag: boolean;
}) {
    const items = getRoutineSnapshot(washFrequency, routine, hasSevereRedFlag);
    return (
        <section
            className="rounded-2xl border border-foreground/15 bg-sage/25 p-5 md:p-6"
            data-testid="routine-at-a-glance"
            aria-labelledby="routine-snapshot-heading"
        >
            <BasedOnAnswers />
            <h2
                id="routine-snapshot-heading"
                className="mt-2 font-serif text-2xl"
            >
                Routine at a glance
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/85">
                {items.map((item) => (
                    <li key={item.label}>
                        <strong className="font-medium text-foreground">
                            {item.label}:
                        </strong>{" "}
                        {item.detail}
                    </li>
                ))}
            </ul>
            <GuideFitNote location="snapshot" />
        </section>
    );
}
