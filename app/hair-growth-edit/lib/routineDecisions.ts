import type { RoutineStep } from "../data/recommendations";

export type RoutineOutcome =
    "comfortable" | "coated" | "dry" | "stiff" | "irritated";

export interface RoutineDecision {
    title: string;
    action: string;
    nextCheck: string;
}

/** Practical next-wash choices, not a diagnosis from how hair feels. */
export function getRoutineDecision(
    routine: RoutineStep[],
    outcome: RoutineOutcome,
): RoutineDecision {
    const leaveIn = routine.find(
        (step) =>
            step.product.category.toLowerCase().includes("leave-in") ||
            step.product.id === "replumpingSuperactive",
    );
    const mask = routine.find((step) =>
        ["nounouMask", "oiMask", "nourishingHairBuildingPak"].includes(
            step.product.id,
        ),
    );
    const conditioner = routine.find(
        (step) =>
            step.product.category.toLowerCase().includes("conditioner") &&
            !step.product.category.toLowerCase().includes("leave-in"),
    );
    const serum = routine.find(
        (step) => step.product.id === "energizingSuperactive",
    );
    const oil = routine.find((step) =>
        step.product.category.toLowerCase().includes("oil"),
    );

    switch (outcome) {
        case "comfortable":
            return {
                title: "Keep what’s working.",
                action: "Repeat your regular wash routine. Keep treatments on their planned washes rather than adding one because your hair felt good.",
                nextCheck:
                    "Notice scalp comfort, ease of detangling, and how your lengths feel once dry. A comfortable wash is useful feedback—not proof of new growth.",
            };
        case "coated":
            return {
                title: "Change the amount before buying a stronger cleanser.",
                action: leaveIn
                    ? `At your next wash, rinse thoroughly and try a smaller amount of ${leaveIn.product.name} on the lengths, keeping the rest of your routine unchanged.`
                    : "At your next wash, rinse thoroughly and use less of one product that stays in your hair, keeping the rest of your routine unchanged.",
                nextCheck: `${oil ? `If you used ${oil.product.name}, you can instead skip that optional finishing step as your one change. ` : ""}Compare how your hair feels once dry. Don’t add an extra scrub or treatment on top of the schedule to compensate.`,
            };
        case "dry":
            return {
                title: "Check conditioning and handling first.",
                action: conditioner
                    ? `On a regular wash, spread ${conditioner.product.name} evenly through the lengths and follow its label’s leave time. Detangle gently, starting at the ends.`
                    : "On a regular wash, follow your conditioning step and its label’s leave time. Detangle gently, starting at the ends.",
                nextCheck: `${mask ? `Keep ${mask.product.name} on its scheduled treatment wash; don’t add extra mask washes yet. ` : ""}Compare detangling and dry ends after the next wash before changing another step. Dryness alone cannot tell you whether you need protein.`,
            };
        case "stiff":
            return {
                title: "Don’t respond with another repair treatment.",
                action: mask
                    ? `If the stiffness started after ${mask.product.name}, pause that treatment and use your regular conditioning wash next. Don’t add a second repair product to fix the feeling.`
                    : "Keep the next wash simple with your regular conditioning step. Don’t introduce a protein or repair treatment just because your hair feels stiff.",
                nextCheck:
                    "Follow your product labels and compare handling after a regular wash. Stiffness alone does not establish protein overload or deficiency. Get professional advice if breakage or symptoms continue.",
            };
        case "irritated":
            return {
                title: "Scalp comfort comes before finishing the routine.",
                action: `Stop the product you suspect is causing irritation and rinse it off as directed. Don’t apply another active product to soothe it.${serum ? ` Pause ${serum.product.name} if it irritates your scalp; it is not a required step.` : ""}`,
                nextCheck:
                    "Seek medical advice for persistent or worsening irritation, pain, sores, or sudden shedding. Seek urgent care for a severe reaction, breathing difficulty, or facial swelling. Don’t keep experimenting through symptoms.",
            };
    }
}
