import { QUESTIONS, type Dimension } from "../data/questions";

export interface PersonalizedSalesCopy {
    reported: string;
    why: string;
    plan: string;
}

const PATTERNS: Record<
    string,
    { dimensions: Dimension[]; why: string; plan: string }
> = {
    "length protection (no dominant damage pattern)": {
        dimensions: [],
        why: "Those are useful things to preserve. Your overall answers did not point to one dominant damage pattern, so there is no reason to invent a problem to solve.",
        plan: "Your Growth Edit turns that starting point into a repeatable wash and styling routine, with guidance on what to keep simple and when to adjust.",
    },
    "product buildup": {
        dimensions: ["BU"],
        why: "That can fit a buildup pattern. Adding more on top may leave your hair feeling heavier, not better cared for.",
        plan: "Your Growth Edit puts cleansing and product amounts in order, so you know what to wash out, what to keep, and what to skip.",
    },
    "dryness / low flexibility": {
        dimensions: ["M"],
        why: "Those answers suggest moisture and gentler handling deserve attention—not just another finishing product.",
        plan: "Your Growth Edit maps out conditioning, leave-in care, and treatment timing, so you can care for dry lengths without guessing at every wash.",
    },
    "compromised internal strength": {
        dimensions: ["P"],
        why: "That is a reason to consider strength care thoughtfully—not to add protein to every wash.",
        plan: "Your Growth Edit shows where your selected treatment fits, when to pause it, and what to do on regular conditioner washes.",
    },
    "low-porosity resistance": {
        dimensions: ["LP"],
        why: "Those observations can help guide product weight and application; they do not prove your hair’s porosity.",
        plan: "Your Growth Edit puts cleansing, amounts, and layering in order, so caring for your hair does not mean piling on more product.",
    },
    "high-porosity moisture loss": {
        dimensions: ["HP"],
        why: "Those answers suggest paying attention to how your lengths feel after washing, rather than only how they look when styled.",
        plan: "Your Growth Edit connects conditioning, leave-in care, and gentle handling, with checkpoints to help you decide what to adjust.",
    },
    "elasticity loss": {
        dimensions: ["EL"],
        why: "That makes handling and treatment spacing worth a closer look. A home stretch test alone cannot diagnose what your hair needs.",
        plan: "Your Growth Edit separates regular care from treatment washes, so you know when to treat and when to keep things simple.",
    },
    "heat / chemical stress": {
        dimensions: ["HC"],
        why: "You’re putting time into your hair. Your care should help protect that effort—heat and chemical services can add stress that another mask alone cannot address.",
        plan: "Your Growth Edit builds care around your styling and services, so you know how to protect your lengths—not just what to put on them afterward.",
    },
    "mechanical tension": {
        dimensions: ["ME"],
        why: "Pulling and friction can work against length retention, even when you are using good products.",
        plan: "Your Growth Edit pairs your product routine with gentler handling, so you know what to change beyond what is on your shelf.",
    },
    breakage: {
        dimensions: ["BR"],
        why: "Those observations suggest protecting the lengths deserves attention. Products cannot put split ends back together.",
        plan: "Your Growth Edit brings conditioning, detangling, and treatment timing together, so you can reduce avoidable handling stress.",
    },
    shedding: {
        dimensions: ["SH"],
        why: "Shedding and breakage are not the same thing. A quiz cannot establish why shedding has changed.",
        plan: "Your Growth Edit gives you a gentle care routine and guidance on what to monitor—not a promise that a product will stop shedding. Persistent or worsening changes deserve professional review.",
    },
    "scalp imbalance": {
        dimensions: ["SC"],
        why: "Scalp comfort matters, but flakes or irritation do not automatically mean you need more scalp products.",
        plan: "Your Growth Edit keeps scalp care separate from care for your lengths, with guidance on when to pause a product and seek professional advice.",
    },
    "moisture + strength imbalance": {
        dimensions: ["M", "P"],
        why: "Your answers suggest both conditioning and strength care need consideration—not every treatment in the same wash.",
        plan: "Your Growth Edit shows how regular washes and selected treatment washes fit together, with clear spacing instead of guesswork.",
    },
    "mixed / uncertain porosity": {
        dimensions: ["LP", "HP"],
        why: "Your observations vary, so forcing your hair into one porosity label would miss that detail.",
        plan: "Your Growth Edit gives you a starting routine and clear adjustment points, so you can respond to how your hair actually feels.",
    },
};

export function getHeatCareCallout(
    answers: Readonly<Record<string, number>>,
): string | null {
    const selected = (id: string) => {
        const index = answers[id];
        return Number.isInteger(index) && index >= 0
            ? QUESTIONS.find((question) => question.id === id)?.options[index]
            : undefined;
    };
    const heat = selected("heatUse");
    if (heat && (heat.scores.HC ?? 0) > 0) {
        return `You use heat ${heat.label.toLowerCase()}. Your plan starts with protection, then adjusts from there.`;
    }
    const chemical = selected("chemical");
    if (chemical && (chemical.scores.HC ?? 0) > 0) {
        return `You selected “${chemical.label}”. Your plan starts with care around your services.`;
    }
    return null;
}

const CONTEXT: Record<string, string> = {
    residue: "Before washing",
    clarify: "After clarifying",
    dryFeel: "A day after conditioning",
    wetting: "Under running water",
    drying: "When air-drying",
    wetFrizz: "While soaking wet",
    ends: "At your ends",
    shed: "Fallen hairs",
    shedChange: "Change in shedding",
    density: "Along your part",
    mushy: "When wet",
    elasticity: "During the stretch test",
    proteinResponse: "After protein",
    heatUse: "Heat styling",
    heatSigns: "Where you see changes",
    chemical: "Chemical services",
    tension: "Tight styles",
    tensionSigns: "After tight styles",
    scalp: "Scalp comfort",
    lossPattern: "Where you notice hair changes",
};

// Quote only validated selections. A calculated pattern is never permission to invent symptoms.
export function getPersonalizedSalesCopy(
    primaryCause: string | undefined,
    answers?: Readonly<Record<string, number>>,
): PersonalizedSalesCopy | null {
    const pattern = primaryCause ? PATTERNS[primaryCause] : undefined;
    if (!pattern || !answers) return null;
    const evidence = QUESTIONS.flatMap((question) => {
        const index = answers[question.id];
        if (!Number.isInteger(index) || index < 0) return [];
        const option = question.options[index];
        if (!option) return [];
        const weight = pattern.dimensions.length
            ? Math.max(
                  ...pattern.dimensions.map((dim) => option.scores[dim] ?? 0),
              )
            : ["ends", "dryFeel"].includes(question.id) && index === 0
              ? 1
              : 0;
        return weight > 0 ? [{ question, option, weight }] : [];
    })
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 2);
    if (!evidence.length) return null;
    return {
        reported: `You told us: ${evidence.map(({ question, option }) => `${CONTEXT[question.id] ?? question.prompt}: “${option.label}”`).join(" · ")}.`,
        why: pattern.why,
        plan: pattern.plan,
    };
}
