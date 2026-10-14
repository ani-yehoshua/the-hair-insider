import {
    getKeratinSchedule,
    type HairProfile,
    type RoutineStep,
} from "../data/recommendations";

export interface WashInstruction {
    title: string;
    detail: string;
}

export interface FirstWashPlan {
    steps: WashInstruction[];
    layers: WashInstruction[];
    keratin: { name: string; timing: string; explanation: string } | null;
}

export function getFirstWashPlan(
    routine: RoutineStep[],
    washFrequency: HairProfile["washFrequency"],
    shouldShampooTwice: boolean,
    stylePreference: HairProfile["stylePreference"],
    hasSevereRedFlag = false,
): FirstWashPlan {
    const find = (id: string) => routine.find((step) => step.product.id === id);
    const shampoo = routine.find((step) =>
        step.product.category.toLowerCase().includes("cleanse"),
    );
    const conditioner = routine.find(
        (step) =>
            step.product.category.toLowerCase().includes("conditioner") &&
            !step.product.category.toLowerCase().includes("leave-in"),
    );
    const protein = !hasSevereRedFlag
        ? find("nourishingHairBuildingPak")
        : undefined;
    const repairMask = !hasSevereRedFlag ? find("nounouMask") : undefined;
    const moistureMask = !hasSevereRedFlag ? find("oiMask") : undefined;
    const leaveIn = routine.find(
        (step) =>
            step.product.category.toLowerCase().includes("leave-in") &&
            (!protein || step.product.id !== "keratinLeaveIn"),
    );
    const serum = !hasSevereRedFlag ? find("energizingSuperactive") : undefined;
    const heat = find("meluShield");
    const styling = routine.find((step) =>
        [
            "volumeMousse",
            "blowdryPrimer",
            "loveSmoothing",
            "curlSerum",
            "curlMousse",
        ].includes(step.product.id),
    );
    const oil = routine.find((step) =>
        ["oiOil", "moroccanoilLight"].includes(step.product.id),
    );
    const usesHeat = ["blowout", "straightened", "curled"].includes(
        stylePreference,
    );
    const schedule = getKeratinSchedule(washFrequency);
    const steps: WashInstruction[] = [
        {
            title: "Start with warm water",
            detail: "Wet your hair and scalp thoroughly with comfortably warm—not hot—water before applying shampoo. This helps the shampoo spread evenly; gentle scalp cleansing and a thorough rinse do the cleaning.",
        },
    ];
    if (shampoo)
        steps.push({
            title: `Cleanse with ${shampoo.product.name}`,
            detail: `Spread the amount on the label between your palms, then work it into your scalp with your fingertips—not your nails. Give the roots your attention and let the lather rinse through the lengths; your ends don’t need to be scrubbed to get clean. Rinse well. ${shouldShampooTwice ? "If residue remains, repeat with a small second lather and rinse again. A second cleanse is for what’s still on your hair, not a reason to keep washing if your scalp feels dry or irritated." : "One gentle lather is a good starting point. You don’t need to shampoo twice when your scalp feels clean."} ${find("detoxScrub") ? "For now, save the detox scrub for a later scheduled wash. It replaces shampoo on that wash rather than giving you another cleansing step today." : ""}`,
        });
    if (protein)
        steps.push({
            title: `First use: ${protein.product.name}`,
            detail: "After shampooing, gently squeeze and towel-blot excess water. Work through your hair in small sections, applying the treatment to the damaged lengths and ends rather than your scalp. Leave for 10–15 minutes according to the label, then rinse thoroughly. Next, apply your recommended conditioner. This is your treatment for today—don’t add another protein treatment or keratin leave-in. The note below explains exactly which washes to skip afterward.",
        });
    if (repairMask)
        steps.push({
            title: `Treat your lengths with ${repairMask.product.name}`,
            detail: "After shampooing, gently squeeze out excess water and smooth the mask through your mid-lengths and ends, keeping it off your scalp. This takes the place of your regular conditioner today—you don’t need both. Gently detangle from the ends upward, leave for the time on your jar, then rinse thoroughly. The current NOUNOU formula has a shorter leave time than the older version, so your label is the one to follow. On your next wash, return to regular conditioner; come back to this mask on the treatment schedule in your product card. Use this mask on its own—don’t layer another repair or protein treatment into the same wash.",
        });
    else if (conditioner)
        steps.push({
            title: `Condition with ${conditioner.product.name}`,
            detail: `Smooth it through your mid-lengths and ends, keeping it away from your roots. ${protein ? `Conditioning still comes after ${protein.product.name}; follow its current label for the recommended pairing.` : moistureMask ? `Use ${conditioner.product.name} today. Save ${moistureMask.product.name} for its scheduled treatment wash, when it replaces conditioner.` : "This is your rinse-out care step today; there is no separate mask to add."} Once your hair feels slippery, gently detangle from the ends upward. Hold each section above a knot so you aren’t pulling at the roots, and work slowly rather than forcing through it. Leave for the time on the label, then rinse thoroughly.`,
        });
    steps.push({
        title: "Remove excess water without rubbing",
        detail: "Gently squeeze the lengths, then press them with a soft towel or T-shirt instead of rubbing or twisting tightly. You’re taking out excess water, not trying to towel-dry your hair completely. If your leave-in or curl product calls for soaking-wet hair, keep the lengths wetter and follow that direction.",
    });
    if (serum)
        steps.push({
            title: `Apply ${serum.product.name} to your scalp`,
            detail: `Patch-test as directed before the first application. Part your clean, towel-dried hair so you can reach your scalp, then apply the amount on the label directly along the partings. Massage gently and leave it in. Hair growth starts at the scalp, which is why this step goes there—not on your ends. The serum supports this part of your routine; it isn’t a promise of regrowth. Continue on your recommended schedule: ${serum.timing}. Stop if irritation occurs rather than trying to push through it.`,
        });
    if (leaveIn)
        steps.push({
            title: `Apply ${leaveIn.product.name}`,
            detail: `Start with a small amount within the label’s directions and work it evenly through your mid-lengths and ends. Give the ends a little extra attention without soaking them in product, and keep it off your roots unless the label says otherwise. ${leaveIn.instruction} Leave it in—this is care that stays with your lengths after rinsing. One leave-in is enough; you don’t need a second one on top.`,
        });
    if (usesHeat && heat)
        steps.push({
            title: `Protect before heat with ${heat.product.name}`,
            detail: "Before styling, take a moment to apply the protectant evenly through the lengths, following its wet- or dry-hair directions. It’s easy to miss the underneath sections, so work through those too. Keep the temperature at the lowest effective setting; protection doesn’t make extra heat harmless. Wait until your hair is completely dry before a flat iron or curling iron.",
        });
    if (styling && stylePreference !== "protective")
        steps.push({
            title: `Style with ${styling.product.name}`,
            detail: `${styling.instruction} Apply a small amount after your leave-in${usesHeat && heat ? " and heat protectant" : ""}, spreading it evenly through the lengths before you style. Let this product do its job rather than adding several styling products at once. You can adjust the amount next wash once you’ve seen how your hair feels dry.`,
        });
    steps.push({
        title: usesHeat
            ? "Dry gently, then finish"
            : "Let your hair dry, then finish",
        detail: usesHeat
            ? `Keep the dryer moving at the lowest effective heat, rather than holding it on one section. Only use a flat iron or curling iron on fully dry, heat-protected hair. ${oil ? `After heat styling is finished, warm one or two drops of ${oil.product.name} between your palms and lightly smooth them over dry ends. Oil is your finishing step, not your heat protectant. If your hair feels coated or limp, use less at the next wash.` : "Once your hair is dry, you’re done—there’s no extra finishing product to add."}`
            : `Let your hair air-dry, or use the gentle drying method for your style. ${oil ? `Once dry, warm one or two drops of ${oil.product.name} between your palms and lightly smooth them over the ends. If your hair feels coated or limp, use less at the next wash.` : "Once your hair is dry, you’re done—there’s no extra finishing product to add."}`,
    });
    const layers: WashInstruction[] = [
        {
            title: "Rinse-out products first",
            detail: `${[shampoo?.product.name, protein?.product.name, repairMask ? `${repairMask.product.name} instead of conditioner on treatment washes` : conditioner?.product.name, "rinse"].filter(Boolean).join(" → ")}. ${moistureMask ? `On its scheduled treatment wash, ${moistureMask.product.name} replaces ${conditioner?.product.name || "conditioner"}. ` : ""}Finish the shower steps and rinse thoroughly before you start the products that stay in your hair.`,
        },
        {
            title: "Keep scalp care separate",
            detail: serum
                ? `${serum.product.name} goes directly on the clean scalp. Your leave-in and styling products go on the lengths, not on top of serum at the roots.`
                : "Keep conditioner, leave-in, styling products, and oil on the lengths rather than building layers at the roots.",
        },
        {
            title: "Layer the lengths in order",
            detail: `${[leaveIn?.product.name, usesHeat && heat ? `${heat.product.name} before heat` : undefined, styling && stylePreference !== "protective" ? styling.product.name : undefined, "dry/style", oil ? `${oil.product.name} on dry ends` : undefined].filter(Boolean).join(" → ")}. Follow each product’s wet- or dry-hair directions.${oil ? " Oil goes last, not before hot tools." : ""}`,
        },
        {
            title: "Give each product room to work",
            detail: `Start with a small amount and spread it evenly. You can add a little where needed, but more product isn’t automatically more care. Sticky, coated, or heavy hair is a cue to use less next time—not to add another layer.${protein ? ` Keep ${protein.product.name} separate from keratin leave-in or another protein treatment in the same wash.` : repairMask ? ` Use ${repairMask.product.name} as your only repair treatment on its scheduled wash.` : ""}`,
        },
    ];
    return {
        steps,
        layers,
        keratin: protein ? { name: protein.product.name, ...schedule } : null,
    };
}
