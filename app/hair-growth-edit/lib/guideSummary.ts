import {
    getWashSchedule,
    type HairProfile,
    type ProductRecommendation,
    type RoutineStep,
} from "../data/recommendations";
import { getWashDayPlan } from "./washDays";

function compactFrequency(timing: string): string {
    return timing
        .replace(/^Every wash day; (?:usually |about )?/, "")
        .replace(/^On wash day[,;]\s*(?:about )?/, "")
        .split(";")[0]
        .replace(/, after washing$/, "")
        .replace(" times weekly", "×/week")
        .replace("once weekly", "once/week");
}

export function getRoutineSummary(
    washFrequency: HairProfile["washFrequency"],
    routine: RoutineStep[],
): string {
    const schedule = getWashSchedule({ washFrequency });
    const steps = [
        `Cleanse ${compactFrequency(schedule.shampoo)}`,
        routine.some((step) =>
            ["nounouMask", "oiMask"].includes(step.product.id),
        )
            ? "Condition regular washes; use your mask instead on treatment washes"
            : "Condition every wash",
        "Leave-in on damp lengths",
    ];
    if (routine.some((step) => step.product.id === "energizingSuperactive")) {
        steps.push(
            `Optional scalp serum ${compactFrequency(schedule.scalpSerum)}`,
        );
    }
    return `Here’s your weekly routine in one glance: ${steps.join(" → ")}.`;
}

export function getRoutineSnapshot(
    washFrequency: HairProfile["washFrequency"],
    routine: RoutineStep[],
    hasSevereRedFlag = false,
) {
    const schedule = getWashSchedule({ washFrequency });
    const plan = getWashDayPlan(routine, hasSevereRedFlag);
    const regularSteps = [
        routine.some(
            (step) =>
                step.product.category.toLowerCase().includes("cleanse") &&
                step.product.id !== "detoxScrub",
        )
            ? "Shampoo"
            : null,
        routine.some((step) =>
            step.product.category.toLowerCase().includes("condition"),
        )
            ? "conditioner"
            : null,
        routine.some((step) =>
            step.product.category.toLowerCase().includes("leave-in"),
        )
            ? "leave-in on damp lengths"
            : null,
    ].filter(Boolean);
    const items = [
        { label: "Wash days", detail: compactFrequency(schedule.shampoo) },
        {
            label: "Regular washes",
            detail: regularSteps.length
                ? regularSteps.join(" → ")
                : "Follow the gentle-care directions in your plan.",
        },
        {
            label: "Treatment days",
            detail: plan.mask
                ? `${plan.mask.product.name} — ${plan.mask.timing}. ${plan.followsWithConditioner ? "Rinse, then condition." : "Use instead of conditioner."}`
                : hasSevereRedFlag
                  ? "Pause intensive treatments while you seek professional assessment."
                  : "No mask is scheduled; follow your regular wash steps.",
        },
    ];
    if (plan.scrub)
        items.push({
            label: "Separate clarifying wash",
            detail: `${plan.scrub.product.name} — ${plan.scrub.timing}. Replaces shampoo; save the mask for another wash.`,
        });
    items.push({
        label: "Between washes / daily care",
        detail: `Handle lengths gently and avoid pulling or rubbing your ends.${routine.some((step) => step.product.category.toLowerCase().includes("heat protectant")) ? " Use heat protectant whenever you heat-style." : ""} No extra daily product step is required.`,
    });
    const serum = hasSevereRedFlag
        ? undefined
        : routine.find((step) => step.product.id === "energizingSuperactive");
    if (serum)
        items.push({
            label: "Optional scalp serum",
            detail: `${serum.timing}. Follow its label and stop if your scalp becomes irritated.`,
        });
    return items;
}

export function getFirstPurchaseReason(product: ProductRecommendation): string {
    if (product.id === "nounouMask") {
        return "it gives your fragile lengths one repair-focused conditioning step, without layering several treatments";
    }
    if (product.id === "nourishingHairBuildingPak") {
        return "you reported a good response to protein, so one targeted treatment is a better place to start than layering several";
    }
    const category = product.category.toLowerCase();
    if (category.includes("heat protectant")) {
        return "it helps limit heat damage during the styling you already do";
    }
    if (category.includes("conditioner")) {
        return "it softens your lengths and makes gentle detangling easier";
    }
    if (category.includes("cleanse")) {
        return "a gentle cleanse removes scalp oil and buildup before you condition or style";
    }
    if (category.includes("leave-in")) {
        return "it helps keep damp lengths soft and easier to detangle before styling";
    }
    if (category.includes("mask")) {
        return "it adds conditioning to fragile lengths without introducing several treatments at once";
    }
    return "";
}

export function getStarterPair(
    routine: RoutineStep[],
    first: ProductRecommendation | null,
    second: ProductRecommendation | null,
): RoutineStep[] {
    if (!first || !second || first.id === second.id) return [];
    const pair = [first, second].map((product) =>
        routine.find((step) => step.product.id === product.id),
    );
    return pair.every((step): step is RoutineStep => step !== undefined)
        ? pair
        : [];
}
