import type { HairProfile } from '../data/recommendations';
import { scrubWashGap, treatmentWashGap } from './washFrequency';
export function getWashSchedule(profile: Pick<HairProfile, "washFrequency">) {
    switch (profile.washFrequency) {
        case "daily":
            return {
                shampoo: "Every wash day; every day",
                scalpSerum: "3 times weekly; not at every wash",
                targetedTreatment: "Every 5–7 wash days (about once weekly)",
                moistureTreatment: "Every 5–7 wash days (about once weekly)",
            };
        case "everyOtherDay":
        case "everyThirdDay":
        case "everyFourFiveDays": {
            const frequency = profile.washFrequency;
            const cadence = frequency === "everyOtherDay" ? "every other day" : frequency === "everyThirdDay" ? "every third day" : "every 4–5 days";
            return {
                shampoo: `Every wash day; ${cadence}`,
                scalpSerum: frequency === "everyOtherDay" ? "After washing, no more than 3 times weekly" : "On your wash days, if tolerated",
                targetedTreatment: `Every ${scrubWashGap(frequency)} completed wash days; never more than once weekly`,
                moistureTreatment: `Every ${treatmentWashGap(frequency)} completed wash days`,
            };
        }
        case "severalWeekly":
            return {
                shampoo: "Every wash day; usually 2–3 times weekly",
                scalpSerum: "2–3 times weekly, after washing",
                targetedTreatment: "Every 3–4 wash days (about once weekly)",
                moistureTreatment:
                    "Every 3–4 wash days (about every 1–2 weeks)",
            };
        case "weekly":
            return {
                shampoo: "Every wash day; about once weekly",
                scalpSerum: "On wash day, once weekly",
                targetedTreatment: "Every wash day, about once weekly",
                moistureTreatment: "Every 2 wash days (about every 2 weeks)",
            };
        case "lessWeekly":
            return {
                shampoo: "Every wash day; less than once weekly",
                scalpSerum: "On wash day; about every 1–2 weeks",
                targetedTreatment: "On a wash day every 1–2 weeks",
                moistureTreatment: "Every 2 wash days (about every 2–4 weeks)",
            };
        default:
            // The app calculates an in-progress preview before this question is
            // answered. Keep that preview safe without treating it as a final result.
            return {
                shampoo: "Every wash day",
                scalpSerum: "After washing, up to 3 times weekly",
                targetedTreatment: "No more than once weekly",
                moistureTreatment: "No more than once weekly",
            };
    }
}
export function getKeratinSchedule(
    washFrequency: HairProfile["washFrequency"],
) {
    const skipWashes = washFrequency === "daily" ? 4 : washFrequency === "everyOtherDay" ? 3 : washFrequency === "everyFourFiveDays" ? 1 : 2;
    return {
        skipWashes,
        timing: `Use on your first wash, then skip the next ${skipWashes} washes; repeat only if needed, no sooner than every ${skipWashes + 1} wash days`,
        explanation:
            "This is a protein-containing rinse-out treatment, not an everyday conditioner or a salon keratin service. Spacing it out lets you see how your hair responds; repeated protein treatments can leave some hair feeling stiff or rough. On the skipped washes, use your regular conditioner. Pause the treatment if your hair feels harder, rougher, or more brittle.",
    };
}
