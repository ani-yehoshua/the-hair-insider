import { useState, useEffect, useMemo } from "react";
import {
    ArrowUpRight,
    Bookmark,
    BookmarkCheck,
    Calendar,
    Filter,
} from "lucide-react";
import type { RoutineStep } from "../data/recommendations";

interface GuideViewProps {
    paidRoutine: RoutineStep[];
    shouldShampooTwice: boolean;
    primaryCause: string;
    behaviorToStop: string;
    observations: string[];
    supportingNeeds: string[];
    washFrequency: "daily" | "severalWeekly" | "weekly" | "lessWeekly";
    stylePreference:
        "natural" | "blowout" | "straightened" | "curled" | "protective";
}

const DAILY_TIPS = [
    "Sleep on a silk or satin pillowcase to reduce overnight friction.",
    "Always detangle starting from the ends and carefully working your way up.",
    "Avoid tight hairstyles that put constant tension on your edges.",
    "Let your hair air dry partially before using a blow dryer to minimize heat exposure.",
    "Apply heat protectant every single time before using hot tools.",
    "Keep your scalp clean; a healthy scalp is the foundation for length retention.",
    "Trim split ends as soon as you see them so they don't travel up the hair shaft.",
    "Massage your scalp gently when washing instead of scrubbing with your nails.",
    "Ensure your hair is thoroughly wet before applying shampoo to help it lather evenly.",
];

function getRoutineBenefit(step: RoutineStep): string {
    const { id, category } = step.product;

    if (id === "jolieFilteredShowerhead") {
        return "This supports every wash step by reducing the mineral and chlorine exposure that can leave hair feeling coated, rough, or harder to manage.";
    }
    if (id === "energizingSuperactive") {
        return "This gives your routine a consistent scalp-focused step without adding weight or treatment products to the lengths.";
    }
    if (id === "detoxScrub") {
        return "This provides occasional residue removal so your regular cleanser and conditioning steps can work without layers of buildup getting in the way.";
    }
    if (
        id === "bioIonicDryer" ||
        id === "bioIonicFlatIron" ||
        id === "bioIonicCurlingIron"
    ) {
        return "This matches the finished style you actually wear while helping you use more controlled heat, fewer repeated passes, and less unnecessary handling.";
    }

    const normalizedCategory = category.toLowerCase();
    if (
        normalizedCategory.includes("shampoo") ||
        normalizedCategory.includes("cleanse")
    ) {
        return "This creates the clean foundation for the rest of your routine while matching the level of moisture, scalp support, and weight your answers call for.";
    }
    if (normalizedCategory.includes("conditioner")) {
        return "This adds slip and softness after cleansing, which helps reduce friction during detangling and protects the lengths from avoidable breakage.";
    }
    if (
        normalizedCategory.includes("mask") ||
        normalizedCategory.includes("keratin") ||
        normalizedCategory.includes("treatment")
    ) {
        return "This is your targeted treatment step. Its scheduled cadence addresses the specific moisture or strength need in your results without over-treating the hair.";
    }
    if (normalizedCategory.includes("leave-in")) {
        return "This keeps slip and moisture in the lengths after rinsing, making detangling and styling easier with less friction.";
    }
    if (normalizedCategory.includes("heat protectant")) {
        return "This places a protective step between fragile lengths and styling heat, supporting the finished look you prefer with less repeated stress.";
    }
    if (
        normalizedCategory.includes("styling") ||
        normalizedCategory.includes("curl")
    ) {
        return "This supports your usual finished style so you can get the result you want without adding several overlapping stylers or excessive manipulation.";
    }
    if (normalizedCategory.includes("oil")) {
        return "This is a finishing step for the ends, helping reduce roughness and friction in the oldest, most breakage-prone part of the hair.";
    }

    return `This fills the ${normalizedCategory} role in your sequence so each product has one clear job and the routine stays focused rather than repetitive.`;
}

export function GuideView({
    paidRoutine,
    shouldShampooTwice,
    primaryCause,
    behaviorToStop,
    observations = [],
    supportingNeeds = [],
    washFrequency,
    stylePreference,
}: GuideViewProps) {
    const [savedProducts, setSavedProducts] = useState<string[]>(() => {
        try {
            const stored = localStorage.getItem("growthEditSavedProducts");
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [showSavedOnly, setShowSavedOnly] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(
                "growthEditSavedProducts",
                JSON.stringify(savedProducts),
            );
        } catch {
            // Saving is an enhancement; storage restrictions should not break the guide.
        }
    }, [savedProducts]);

    const toggleSave = (id: string) => {
        setSavedProducts((prev) =>
            prev.includes(id)
                ? prev.filter((pId) => pId !== id)
                : [...prev, id],
        );
    };

    // Date.now() is impure and can't run directly in the render body
    // (useMemo included), and setting state from an effect just to read it
    // once causes an extra cascading render. useState's lazy initializer is
    // the one React-sanctioned place for one-time impure setup like this --
    // it runs once on mount, not on every render.
    const [dailyTip] = useState(() => {
        const dayIndex = Math.floor(Date.now() / 86400000);
        return DAILY_TIPS[dayIndex % DAILY_TIPS.length];
    });

    const firstThreeSteps = useMemo(() => {
        const unique = new Map();
        for (const step of paidRoutine) {
            if (!unique.has(step.product.id)) {
                unique.set(step.product.id, step);
            }
            if (unique.size === 3) break;
        }
        return Array.from(unique.values());
    }, [paidRoutine]);

    const hasProtein = paidRoutine.some(
        (step) => step.product.id === "nourishingHairBuildingPak",
    );
    const hasScrub = paidRoutine.some(
        (step) => step.product.id === "detoxScrub",
    );
    const shampooStep = paidRoutine.find((step) =>
        step.product.category.toLowerCase().includes("cleanse"),
    );
    const treatmentSteps = paidRoutine.filter((step) =>
        [
            "detoxScrub",
            "oiMask",
            "nounouMask",
            "nourishingHairBuildingPak",
        ].includes(step.product.id),
    );
    const washRhythm = {
        daily: "Most days, based on your current washing pattern",
        severalWeekly: "Two to three wash days each week",
        weekly: "One main wash day each week",
        lessWeekly: "One wash day every one to two weeks",
    }[washFrequency];
    const styleLabel = {
        natural: "your natural texture",
        blowout: "your usual blowout",
        straightened: "your straightened finish",
        curled: "your curled or waved finish",
        protective: "your protective style",
    }[stylePreference];

    const displayedRoutine = showSavedOnly
        ? paidRoutine.filter((step) => savedProducts.includes(step.product.id))
        : paidRoutine;

    return (
        <div
            className="mx-auto w-full max-w-5xl px-5 pb-32 pt-12 md:px-8 md:pt-20 slide-up"
            data-testid="section-guide"
        >
            {/* Guide Header */}
            <div className="max-w-3xl">
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground/60">
                    Your Digital Plan
                </span>
                <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
                    The Complete Growth Edit
                </h1>
                <p className="mt-6 text-sm leading-relaxed text-foreground/80 md:text-base">
                    This is your personalized length-retention guide. Your
                    routine is structured to address{" "}
                    <strong>{primaryCause}</strong> and protect your ends while
                    avoiding <strong>{behaviorToStop}</strong>. Follow the exact
                    cadences below to build a foundation for healthy growth.
                </p>
            </div>

            {/* Daily Tip */}
            <div
                className="mt-16 rounded-2xl border border-foreground/15 bg-paper p-6 md:p-8"
                data-testid="daily-tip"
            >
                <div className="flex items-center gap-3">
                    <Calendar className="text-sage" size={20} />
                    <h2 className="font-serif text-xl">
                        Daily Length-Retention Tip
                    </h2>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                    {dailyTip}
                </p>
            </div>

            {/* Personalized Action Plan */}
            <div
                className="mt-16 border-t border-foreground/15 pt-16"
                data-testid="action-plan"
            >
                <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                    How to follow your results
                </span>
                <h2 className="mt-3 font-serif text-3xl text-foreground md:text-4xl">
                    Your Action Plan
                </h2>
                <p className="mt-5 max-w-3xl text-sm leading-relaxed text-foreground/75 md:text-base">
                    Your strongest pattern is{" "}
                    <strong className="font-medium text-foreground">
                        {primaryCause}
                    </strong>
                    . The goal is not to add more products at once. It is to
                    remove the stress caused by{" "}
                    <strong className="font-medium text-foreground">
                        {behaviorToStop}
                    </strong>
                    , establish a repeatable wash rhythm, and then judge the
                    routine by how your scalp and lengths respond over time.
                </p>

                <div className="mt-10 rounded-3xl border border-foreground/15 bg-paper-dark p-6 md:p-10">
                    <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
                        Why this strategy fits
                    </span>
                    <div className="mt-6 grid gap-6 md:grid-cols-[0.85fr_1.15fr] md:gap-12">
                        <div>
                            <h3 className="font-serif text-2xl">
                                What your answers showed
                            </h3>
                            <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                                Your result was supported by{" "}
                                {observations.length > 1
                                    ? `${observations[0]} and ${observations[1]}`
                                    : observations[0] ||
                                      "the pattern across your answers"}
                                . Those signs make consistency and low-friction
                                handling more important than chasing a single
                                “growth” product.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-serif text-2xl">
                                What the plan is designed to do
                            </h3>
                            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/80">
                                <li>
                                    <strong className="font-medium text-foreground">
                                        Clean consistently:
                                    </strong>{" "}
                                    Prevent residue and scalp oil from
                                    interfering with the conditioning and
                                    styling steps that follow.
                                </li>
                                <li>
                                    <strong className="font-medium text-foreground">
                                        Protect the lengths:
                                    </strong>{" "}
                                    Reduce friction, rough detangling, repeated
                                    heat, and unnecessary handling of the oldest
                                    hair.
                                </li>
                                <li>
                                    <strong className="font-medium text-foreground">
                                        Change one variable at a time:
                                    </strong>{" "}
                                    Introduce the routine in phases so you can
                                    tell which adjustment is helping or causing
                                    a problem.
                                </li>
                            </ul>
                            {supportingNeeds.length > 0 && (
                                <div className="mt-5 border-t border-foreground/15 pt-5">
                                    {supportingNeeds.map((need) => (
                                        <p
                                            key={need}
                                            className="text-sm leading-relaxed text-foreground/75"
                                        >
                                            {need}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
                        Your repeatable rhythm
                    </span>
                    <h3 className="mt-3 font-serif text-3xl">
                        The weekly schedule
                    </h3>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/75">
                        Plan for{" "}
                        <strong className="font-medium text-foreground">
                            {washRhythm.toLowerCase()}
                        </strong>
                        . Use this sequence as the default, then follow the
                        exact cadence printed on each product card.
                    </p>
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-foreground/15 bg-paper p-6">
                            <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                                Wash day
                            </span>
                            <h4 className="mt-3 font-serif text-xl">
                                Cleanse and condition
                            </h4>
                            <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                                {shampooStep?.timing || "Every wash day"}.
                                Cleanse the scalp, condition the lengths,
                                detangle gently, then apply leave-in before
                                styling.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-foreground/15 bg-paper p-6">
                            <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                                Treatment wash
                            </span>
                            <h4 className="mt-3 font-serif text-xl">
                                Use the scheduled treatment
                            </h4>
                            {treatmentSteps.length > 0 ? (
                                <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/75">
                                    {treatmentSteps.map((step) => (
                                        <p key={step.product.id}>
                                            <strong className="font-medium text-foreground">
                                                {step.product.name}:
                                            </strong>{" "}
                                            {step.timing}.
                                        </p>
                                    ))}
                                    <p>
                                        Each treatment replaces its comparable
                                        regular step. Do not stack them in the
                                        same wash.
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                                    Keep the wash simple. Do not add a separate
                                    scrub or protein treatment unless your
                                    results change.
                                </p>
                            )}
                        </div>
                        <div className="rounded-2xl border border-foreground/15 bg-paper p-6">
                            <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                                Between washes
                            </span>
                            <h4 className="mt-3 font-serif text-xl">
                                Protect, do not restart
                            </h4>
                            <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                                Preserve {styleLabel}, smooth only a small
                                amount of oil over rough ends if needed, and
                                avoid layering more products at the roots. Use
                                the scalp step only at its listed cadence.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 rounded-3xl bg-sage/25 p-6 md:p-10">
                    <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
                        Introduce the routine gradually
                    </span>
                    <h3 className="mt-3 font-serif text-3xl">
                        Your first 30 days
                    </h3>
                    <div className="mt-8 grid gap-8 md:grid-cols-3">
                        <div>
                            <p className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                                Days 1–7
                            </p>
                            <h4 className="mt-2 font-serif text-xl">
                                Set the baseline
                            </h4>
                            <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                                Start with the cleanser, conditioner, leave-in,
                                and the behavior change above. Take one photo of
                                your ends and note scalp comfort, shedding
                                during washing, tangling, and breakage.
                            </p>
                        </div>
                        <div>
                            <p className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                                Days 8–14
                            </p>
                            <h4 className="mt-2 font-serif text-xl">
                                Add targeted support
                            </h4>
                            <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                                If the core steps feel comfortable, add the
                                scalp product and your scheduled mask or
                                treatment. Patch test leave-on scalp products
                                and stop if irritation develops.
                            </p>
                        </div>
                        <div>
                            <p className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                                Days 15–30
                            </p>
                            <h4 className="mt-2 font-serif text-xl">
                                Refine the amount
                            </h4>
                            <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                                Add styling and finishing products only as
                                needed. Adjust the amount before changing the
                                product: use less if hair feels coated, and add
                                a little more only when lengths still feel
                                rough.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 grid gap-8 md:grid-cols-2">
                    <div>
                        <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
                            How to judge progress
                        </span>
                        <h3 className="mt-3 font-serif text-3xl">
                            Your checkpoints
                        </h3>
                        <div className="mt-6 space-y-5">
                            <div className="border-l border-foreground/25 pl-5">
                                <h4 className="font-medium text-foreground">
                                    After 2 weeks
                                </h4>
                                <p className="mt-1 text-sm leading-relaxed text-foreground/75">
                                    Look for easier detangling, a comfortable
                                    scalp, less coating, and fewer snapped
                                    pieces during handling—not dramatic length
                                    change.
                                </p>
                            </div>
                            <div className="border-l border-foreground/25 pl-5">
                                <h4 className="font-medium text-foreground">
                                    After 4–6 weeks
                                </h4>
                                <p className="mt-1 text-sm leading-relaxed text-foreground/75">
                                    Compare breakage, tangling, end texture, and
                                    how long your finished style lasts against
                                    your baseline notes.
                                </p>
                            </div>
                            <div className="border-l border-foreground/25 pl-5">
                                <h4 className="font-medium text-foreground">
                                    After 8–12 weeks
                                </h4>
                                <p className="mt-1 text-sm leading-relaxed text-foreground/75">
                                    Review photos taken in similar lighting and
                                    styling. Retention shows up as
                                    fuller-looking ends and less repeated
                                    breakage; growth rate itself may not visibly
                                    change.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
                            Adjust without guessing
                        </span>
                        <h3 className="mt-3 font-serif text-3xl">
                            Troubleshooting
                        </h3>
                        <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/75">
                            <p>
                                <strong className="font-medium text-foreground">
                                    Hair feels coated or limp:
                                </strong>{" "}
                                Reduce leave-in, styler, and oil amounts first.
                                If residue persists, use the cleansing cadence
                                in this guide rather than adding another
                                treatment.
                            </p>
                            <p>
                                <strong className="font-medium text-foreground">
                                    Ends still feel dry:
                                </strong>{" "}
                                Confirm conditioner is reaching every section,
                                detangle while it has slip, and apply leave-in
                                to damp lengths before increasing oil.
                            </p>
                            <p>
                                <strong className="font-medium text-foreground">
                                    Hair feels hard or unusually brittle:
                                </strong>{" "}
                                Pause protein-containing treatments and avoid
                                adding strength products until flexibility
                                returns.
                            </p>
                            <p>
                                <strong className="font-medium text-foreground">
                                    Scalp stings, burns, or stays irritated:
                                </strong>{" "}
                                Stop the newest scalp product, rinse thoroughly,
                                and seek professional guidance if symptoms
                                persist or worsen.
                            </p>
                            <p>
                                <strong className="font-medium text-foreground">
                                    Breakage is unchanged:
                                </strong>{" "}
                                Audit detangling, tension, heat, and nighttime
                                friction before buying another product.
                                Technique can cancel out an otherwise
                                appropriate routine.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Guidance Section */}
            <div className="mt-16 border-t border-foreground/15 pt-16">
                <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                    Strategic Application
                </span>
                <h2 className="mt-3 font-serif text-3xl text-foreground">
                    Premium Guidance
                </h2>

                <div className="mt-10">
                    {/* Where to spend first */}
                    <div>
                        <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
                            Your first three purchases
                        </span>
                        <h3 className="mt-3 font-serif text-3xl">
                            Where to spend first
                        </h3>
                        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/75">
                            Start with these three products before expanding
                            your routine. They give you the strongest foundation
                            for the pattern identified in your results.
                        </p>

                        <div className="mt-10 space-y-6">
                            {firstThreeSteps.map((step, index) => (
                                <div
                                    key={step.product.id}
                                    className="group flex flex-col gap-6 rounded-3xl border border-foreground/15 bg-paper p-6 md:flex-row md:items-stretch md:p-8"
                                    data-testid={`priority-product-${step.product.id}`}
                                >
                                    <div className="flex min-h-52 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/70 p-5 mix-blend-multiply md:w-56">
                                        <img
                                            src={step.product.image}
                                            alt={`${step.product.name} by ${step.product.brand}`}
                                            className="h-44 w-44 object-contain transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                                                Priority {index + 1} /{" "}
                                                {step.product.category}
                                            </span>
                                            <span className="w-fit rounded-full bg-sage/30 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-widest text-foreground/80">
                                                {step.timing}
                                            </span>
                                        </div>
                                        <h4 className="mt-4 font-serif text-2xl leading-tight">
                                            {step.product.name}
                                        </h4>
                                        <p className="mt-1 text-xs font-medium text-foreground/60">
                                            {step.product.brand}
                                        </p>
                                        <p className="mt-5 text-sm leading-relaxed text-foreground/80">
                                            <strong className="font-medium text-foreground">
                                                Why this comes first:
                                            </strong>{" "}
                                            {step.product.reason}
                                        </p>
                                        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                                            <strong className="font-medium text-foreground">
                                                How to use:
                                            </strong>{" "}
                                            {step.instruction}
                                        </p>
                                        <a
                                            href={step.product.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-6 inline-flex items-center gap-2 self-start text-[0.7rem] font-medium uppercase tracking-widest text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
                                        >
                                            View on Retailer{" "}
                                            <ArrowUpRight size={12} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* What to skip */}
                    <div className="mt-12 rounded-3xl border border-foreground/15 bg-sage/25 px-6 py-8 md:grid md:grid-cols-[11rem_1fr] md:gap-10 md:px-10 md:py-10">
                        <div>
                            <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
                                Protect your budget
                            </span>
                            <h3 className="mt-2 font-serif text-2xl">
                                What to skip
                            </h3>
                        </div>
                        <div>
                            <p className="mt-5 text-sm leading-relaxed text-foreground/80 md:mt-0">
                                Avoid duplicate-purpose impulse buys that are
                                not part of your plan:
                            </p>
                            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/80">
                                <li>
                                    <strong className="font-medium text-foreground">
                                        Extra styling creams:
                                    </strong>{" "}
                                    Do not add another cream unless it replaces
                                    the styling step already listed below.
                                </li>
                                {!hasScrub && (
                                    <li>
                                        <strong className="font-medium text-foreground">
                                            Harsh clarifying scrubs:
                                        </strong>{" "}
                                        Your scalp pattern does not call for
                                        aggressive exfoliation.
                                    </li>
                                )}
                                {!hasProtein && (
                                    <li>
                                        <strong className="font-medium text-foreground">
                                            Heavy protein treatments:
                                        </strong>{" "}
                                        Your results do not support adding a
                                        separate high-protein treatment.
                                    </li>
                                )}
                                <li>
                                    <strong className="font-medium text-foreground">
                                        Duplicate treatments:
                                    </strong>{" "}
                                    One product per purpose is enough;
                                    overlapping products add cost without giving
                                    the step a clearer job.
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* What not to combine */}
                    <div className="mt-6 rounded-3xl border border-foreground/15 bg-paper-dark px-6 py-8 md:grid md:grid-cols-[11rem_1fr] md:gap-10 md:px-10 md:py-10">
                        <div>
                            <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
                                Avoid overlap
                            </span>
                            <h3 className="mt-2 font-serif text-2xl">
                                What not to combine
                            </h3>
                        </div>
                        <ul className="mt-5 space-y-3 text-sm leading-relaxed text-foreground/80 md:mt-0">
                            {hasProtein && (
                                <li>
                                    <strong className="font-medium text-foreground">
                                        Protein with more protein:
                                    </strong>{" "}
                                    Do not stack keratin leave-ins or protein
                                    stylers with your NOURISHING Hair Building
                                    Pak.
                                </li>
                            )}
                            {hasScrub && (
                                <li>
                                    <strong className="font-medium text-foreground">
                                        Scrub with regular shampoo:
                                    </strong>{" "}
                                    The detox scrub replaces shampoo on its
                                    scheduled treatment day; do not use both
                                    cleansers in the same wash.
                                </li>
                            )}
                            <li>
                                <strong className="font-medium text-foreground">
                                    High heat with fresh chemical stress:
                                </strong>{" "}
                                Avoid adding intense hot-tool styling when the
                                hair has just been chemically processed.
                            </li>
                            <li>
                                <strong className="font-medium text-foreground">
                                    More frequent treatment applications:
                                </strong>{" "}
                                Follow the cadence shown in your routine. Doing
                                more does not make hair grow faster.
                            </li>
                        </ul>
                    </div>

                    {/* Cleansing Instructions */}
                    <div className="mt-6 rounded-3xl border border-foreground/15 bg-paper-dark px-6 py-8 md:grid md:grid-cols-[11rem_1fr] md:gap-10 md:px-10 md:py-10">
                        <div>
                            <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/50">
                                Your wash method
                            </span>
                            <h3 className="mt-2 font-serif text-2xl">
                                Cleansing instructions
                            </h3>
                        </div>
                        <p className="mt-5 text-sm leading-relaxed text-foreground/80 md:mt-0">
                            {shouldShampooTwice
                                ? "Use two gentle shampoo passes on wash day. The first loosens surface oil and product residue; the second completes the cleanse. Focus both passes at the scalp and rinse thoroughly between them."
                                : "Use one gentle shampoo pass on wash day. Focus the lather at the scalp and let the rinse water carry it through the lengths rather than scrubbing the ends."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Routine Steps */}
            <div className="mt-24 border-t border-foreground/15 pt-16">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                            Your Step-by-Step
                        </span>
                        <h2 className="mt-3 font-serif text-3xl text-foreground">
                            The Complete Routine
                        </h2>
                    </div>
                    <button
                        onClick={() => setShowSavedOnly(!showSavedOnly)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                            showSavedOnly
                                ? "border-foreground bg-foreground text-background"
                                : "border-foreground/20 text-foreground hover:bg-foreground/5"
                        }`}
                        data-testid="filter-saved-products"
                    >
                        <Filter size={14} />
                        {showSavedOnly
                            ? "Show Full Routine"
                            : `Saved Products (${savedProducts.length})`}
                    </button>
                </div>

                {displayedRoutine.length === 0 && showSavedOnly && (
                    <div className="mt-12 rounded-2xl border border-dashed border-foreground/20 py-16 text-center text-foreground/60">
                        You haven&apos;t saved any products yet.
                    </div>
                )}

                <div className="mt-12 space-y-8">
                    {displayedRoutine.map((step, index) => {
                        const isSaved = savedProducts.includes(step.product.id);
                        return (
                            <div
                                key={`${step.product.id}-${index}`}
                                className="group flex flex-col gap-8 rounded-3xl border border-foreground/15 bg-paper p-6 md:flex-row md:p-8"
                                data-testid={`routine-step-${step.product.id}`}
                            >
                                {/* Product Image & Save */}
                                <div className="relative flex w-full shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl bg-white/70 p-6 mix-blend-multiply md:w-64">
                                    <button
                                        onClick={() =>
                                            toggleSave(step.product.id)
                                        }
                                        className="absolute right-4 top-4 z-10 p-2 text-foreground/40 transition-colors hover:text-foreground"
                                        title={
                                            isSaved
                                                ? "Remove from saved"
                                                : "Save product"
                                        }
                                        data-testid={`save-product-${step.product.id}`}
                                    >
                                        {isSaved ? (
                                            <BookmarkCheck
                                                className="text-foreground"
                                                size={24}
                                            />
                                        ) : (
                                            <Bookmark size={24} />
                                        )}
                                    </button>
                                    <img
                                        src={step.product.image}
                                        alt={`${step.product.name} by ${step.product.brand}`}
                                        className="h-48 w-48 object-contain transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex flex-1 flex-col">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                                            Step {step.order} /{" "}
                                            {step.product.category}
                                        </span>
                                        <span className="rounded-full bg-sage/30 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-widest text-foreground/80 text-center inline-block">
                                            {step.timing}
                                        </span>
                                    </div>

                                    <h3 className="font-serif text-2xl leading-tight text-foreground">
                                        {step.product.name}
                                    </h3>
                                    <p className="mt-1 text-xs font-medium text-foreground/60">
                                        {step.product.brand}
                                    </p>

                                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <p className="text-sm leading-relaxed text-foreground/80">
                                                <strong className="font-medium text-foreground">
                                                    Why this is in your routine:
                                                </strong>{" "}
                                                {step.product.reason}
                                            </p>
                                            <p className="text-sm leading-relaxed text-foreground/80">
                                                <strong className="font-medium text-foreground">
                                                    How to use:
                                                </strong>{" "}
                                                {step.instruction}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-paper-dark p-5">
                                            <h4 className="font-serif text-lg">
                                                How it benefits your routine
                                            </h4>
                                            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                                                {getRoutineBenefit(step)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-8">
                                        <a
                                            href={step.product.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-widest text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
                                        >
                                            View on Retailer{" "}
                                            <ArrowUpRight size={12} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
