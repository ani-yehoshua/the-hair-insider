export type Dimension = 
  | 'M' | 'P' | 'BU' | 'LP' | 'HP' | 'EL' | 'BR' 
  | 'SH' | 'ME' | 'HC' | 'SC' | 'CO' | 'RF'
  | 'fine' | 'medium' | 'coarse' | 'mixedDiameter'
  | 'straight' | 'wavy' | 'curly' | 'coily'
  | 'lowDensity' | 'mediumDensity' | 'highDensity';

export interface Option {
  label: string;
  scores: Partial<Record<Dimension, number>>;
}

export interface Question {
  id: string;
  prompt: string;
  help: string;
  preparationTitle?: string;
  preparation?: string[];
  options: Option[];
}

export const QUESTIONS: Question[] = [
  {
    id: "diameter",
    prompt: "First, let’s find the thickness of one individual hair strand.",
    help: "This is strand diameter—not how much hair you have. It helps determine whether your hair is easily weighed down or needs richer support.",
    preparationTitle: "How to do the strand test",
    preparation: [
      "Find one naturally shed strand from your brush, clothing, or shower. Do not pull a strand from your scalp.",
      "Make sure the strand is clean, dry, and free of styling product.",
      "Place the middle of the strand between your thumb and index finger. Close your eyes and gently roll it back and forth.",
      "Focus only on how noticeable the single strand feels between your fingertips."
    ],
    options: [
      { label: "I can barely feel it, or cannot feel it at all — likely fine", scores: { fine: 2 } },
      { label: "I can feel it, but it does not feel thick or wiry — likely medium", scores: { medium: 2 } },
      { label: "It feels very noticeable, sturdy, or like a fine thread — likely coarse", scores: { coarse: 2 } },
      { label: "Different strands feel noticeably different, or I still cannot tell", scores: { mixedDiameter: 2 } }
    ]
  },
  {
    id: "pattern",
    prompt: "Next, let’s identify the natural shape your hair makes on its own.",
    help: "This is your natural texture pattern—not how frizzy, smooth, or styled your hair looks. The pattern helps determine how moisture travels through the strand and which product weights are most suitable.",
    preparationTitle: "How to see your natural texture",
    preparation: [
      "Use freshly washed hair with no leave-in, gel, mousse, oil, or heat styling.",
      "Gently blot with a towel. Do not brush, comb, scrunch, braid, or twist it into a shape.",
      "Let it air-dry completely, then look at several sections—not only the hair around your face.",
      "Choose the pattern you see most often. If you see two patterns, choose the one covering the largest area."
    ],
    options: [
      { label: "Straight — it falls without a repeated bend", scores: { straight: 2 } },
      { label: "Wavy — it forms loose or defined S-shapes", scores: { wavy: 2 } },
      { label: "Curly — it forms loops, spirals, or ringlets", scores: { curly: 2 } },
      { label: "Coily — it forms tight coils, small loops, or zigzags", scores: { coily: 2 } },
      { label: "I see a mixture, or I still cannot tell", scores: {} }
    ]
  },
  {
    id: "usualStyle",
    prompt: "How do you wear your hair most of the time?",
    help: "This is separate from your natural texture. It tells us which styling products and tools you will realistically use, so curly products are not recommended simply because your unstyled hair is curly.",
    preparationTitle: "Choose your real-life default",
    preparation: [
      "Think about how your hair looks on most days over a typical month—not only wash day or special occasions.",
      "Choose the finished style you maintain most often, even if it is different from your natural pattern.",
      "If you alternate, choose the style that takes the most effort or heat to maintain.",
      "Do not choose what you wish you wore; choose what you actually wear now."
    ],
    options: [
      { label: "Natural texture — air-dried, wash-and-go, diffused, or naturally straight", scores: {} },
      { label: "Blown out — smooth or stretched with a blow dryer or heated brush", scores: {} },
      { label: "Straightened — usually finished with a flat iron", scores: {} },
      { label: "Curled or waved — usually finished with a curling iron or wand", scores: {} },
      { label: "Protective style — braids, twists, extensions, or wigs most of the time", scores: {} }
    ]
  },
  {
    id: "density",
    prompt: "In bright light, how much scalp shows along a normal part?",
    help: "This measures your hair density, which influences how heavy your styling products should be and alerts us to potential thinning.",
    preparationTitle: "How to assess your density",
    preparation: [
      "Start with clean, dry hair in a brightly lit room or in daylight.",
      "Part your hair normally without pulling or stretching the part wide.",
      "Look closely at how easily you can see your scalp through the hair at the roots.",
      "If you notice more scalp showing recently than in the past, choose the 'Recently more visible' option."
    ],
    options: [
      { label: "Scalp easily visible", scores: { lowDensity: 2 } },
      { label: "Thin line visible", scores: { mediumDensity: 2 } },
      { label: "Scalp hard to see", scores: { highDensity: 2 } },
      { label: "Recently more visible", scores: { SH: 2, RF: 1 } }
    ]
  },
  {
    id: "shed",
    prompt: "What do most fallen hairs look like?",
    help: "This tells us if your hair is shedding naturally from the root or breaking off along the strand, which require entirely different treatments.",
    preparationTitle: "How to inspect fallen hair",
    preparation: [
      "Collect a few loose hairs from your brush, shower drain, or clothing.",
      "Hold one hair up to a light background and look closely at the root end.",
      "A tiny white or dark speck (the bulb) means the hair naturally shed from the root.",
      "No bulb and shorter pieces mean the hair broke off along the strand."
    ],
    options: [
      { label: "Full-length with a bulb", scores: { SH: 3 } },
      { label: "Short pieces, no bulb", scores: { BR: 3 } },
      { label: "A mix of both", scores: { SH: 2, BR: 2 } },
      { label: "Hardly any", scores: {} }
    ]
  },
  {
    id: "shedChange",
    prompt: "Has full-length shedding changed?",
    help: "Tracking changes in your shedding rate helps identify if internal or environmental factors are shortening your hair's growth phase.",
    preparationTitle: "How to measure shedding changes",
    preparation: [
      "Think about the amount of hair you typically see in the shower, on your brush, or on your clothes.",
      "Consider if this amount has stayed the same over the last few months.",
      "If you are seeing noticeably more hair falling out than usual, note if it happened suddenly or gradually.",
      "If you are unsure or haven't paid attention, choose 'Unsure'."
    ],
    options: [
      { label: "No", scores: {} },
      { label: "Gradually more", scores: { SH: 2 } },
      { label: "Suddenly much more", scores: { SH: 3, RF: 3 } },
      { label: "Unsure", scores: {} }
    ]
  },
  {
    id: "ends",
    prompt: "Inspect ends over dark and light backgrounds. What appears?",
    help: "Checking your ends helps determine the physical integrity of your oldest hair, highlighting structural weakness and mechanical damage.",
    preparationTitle: "How to check your ends",
    preparation: [
      "Take a small section of dry hair and fan out the very ends.",
      "Look at the ends against a dark background, then against a light background.",
      "Check for splitting (forks), tiny white dots (fractures), or uneven broken pieces.",
      "Gently bend the ends—if they snap off easily, note that in your answer."
    ],
    options: [
      { label: "Smooth and intact", scores: {} },
      { label: "Some splits", scores: { BR: 2 } },
      { label: "Many splits or white dots", scores: { BR: 3 } },
      { label: "Snaps during handling", scores: { BR: 3, EL: 1 } }
    ]
  },
  {
    id: "wetFrizz",
    prompt: "Is your hair frizzy while soaking wet?",
    help: "Wet frizz reveals whether your hair cuticles are raised or damaged. Smooth cuticles lay flat when wet, while raised cuticles repel water.",
    preparationTitle: "How to test wet frizz",
    preparation: [
      "Observe your hair while you are still in the shower, completely soaking wet.",
      "Do this before applying any towel, leave-in conditioner, or styling product.",
      "Look at whether the strands group smoothly together or if individual hairs frizz outward.",
      "If only the ends or top layers frizz, choose 'Only ends or sections'."
    ],
    options: [
      { label: "No", scores: {} },
      { label: "Only ends or sections", scores: { HP: 2, M: 1, HC: 1 } },
      { label: "Most of it", scores: { HP: 3, M: 2 } },
      { label: "Unsure", scores: {} }
    ]
  },
  {
    id: "wetting",
    prompt: "Under running water, how quickly does hair become fully wet?",
    help: "This measures your hair's porosity—how easily moisture enters the strand. It tells us whether you need lightweight or heavy-duty moisture.",
    preparationTitle: "How to test water absorption",
    preparation: [
      "Step into the shower with completely dry hair and no styling products.",
      "Stand under the water stream and observe how your hair reacts instantly.",
      "Notice if the water beads up and rolls off initially, or if your hair darkens and soaks it in immediately.",
      "If different areas of your head react differently, choose 'Varies'."
    ],
    options: [
      { label: "Beads or takes over a minute", scores: { LP: 3, BU: 1 } },
      { label: "Wets steadily", scores: {} },
      { label: "Soaks immediately", scores: { HP: 3 } },
      { label: "Varies", scores: { LP: 1, HP: 1 } }
    ]
  },
  {
    id: "drying",
    prompt: "Without heat, what happens after washing?",
    help: "This confirms your porosity. How your hair releases moisture is just as important as how it absorbs it.",
    preparationTitle: "How to observe drying time",
    preparation: [
      "After washing, towel-blot your hair gently and let it air-dry without any heat tools.",
      "Note how long it takes to become completely dry compared to others or past experience.",
      "Pay attention to how the hair feels once fully dry—whether it feels soft, rough, or exactly the same as usual.",
      "If certain sections dry instantly while others stay wet for hours, choose 'Varies'."
    ],
    options: [
      { label: "Stays wet very long", scores: { LP: 2, BU: 1 } },
      { label: "Dries steadily", scores: {} },
      { label: "Dries fast, then feels rough", scores: { HP: 3, M: 2 } },
      { label: "Varies", scores: { HP: 1, LP: 1 } }
    ]
  },
  {
    id: "residue",
    prompt: "Before washing, what can you see or feel?",
    help: "This spots product buildup or mineral accumulation, which blocks moisture and causes artificial dryness and breakage.",
    preparationTitle: "How to check for buildup",
    preparation: [
      "Before your next wash, run your fingers firmly through your roots and along the lengths.",
      "Feel for a waxy, sticky, or coated sensation rather than natural hair texture.",
      "Look in a mirror for any white flakes, dullness, or greasiness that feels heavy.",
      "Choose the option that best describes the strongest sensation you find."
    ],
    options: [
      { label: "Clean and light", scores: {} },
      { label: "Roots feel coated", scores: { BU: 2 } },
      { label: "Lengths feel waxy or dull", scores: { BU: 3 } },
      { label: "Flakes stuck to scalp", scores: { SC: 2, RF: 1 } }
    ]
  },
  {
    id: "clarify",
    prompt: "After a thorough clarifying wash, what changes?",
    help: "This helps confirm if your dryness is actually just product buildup. Clarifying removes buildup, returning your hair to its true state.",
    preparationTitle: "How to recall clarifying results",
    preparation: [
      "Think back to the last time you used a strong, deep-cleansing clarifying shampoo.",
      "Consider how your hair felt immediately afterward—was it instantly lighter and softer, or unusually dry and rough?",
      "If you have never purposefully used a clarifying shampoo, choose 'Never tried'."
    ],
    options: [
      { label: "Much lighter and softer", scores: { BU: 3 } },
      { label: "Little change", scores: {} },
      { label: "Drier or rougher", scores: { M: 2, HP: 1 } },
      { label: "Never tried", scores: {} }
    ]
  },
  {
    id: "dryFeel",
    prompt: "One day after conditioning, how do the lengths feel?",
    help: "This measures how well your hair retains moisture after wash day. Good retention means your products match your porosity.",
    preparationTitle: "How to evaluate moisture retention",
    preparation: [
      "Wait 24 hours after your wash and condition routine.",
      "Feel the mid-lengths and ends of your hair—avoiding the roots, which may be naturally oily.",
      "Notice if the hair still feels soft and flexible, or if it has turned rough, dry, and prone to tangling.",
      "If the hair feels heavy, sticky, or coated rather than moisturized, choose 'Heavy or coated'."
    ],
    options: [
      { label: "Soft and flexible", scores: {} },
      { label: "Rough and tangly", scores: { M: 3 } },
      { label: "Soft then quickly dry", scores: { M: 2, HP: 2 } },
      { label: "Heavy or coated", scores: { BU: 3 } }
    ]
  },
  {
    id: "mushy",
    prompt: "When wet, does hair feel gummy or overly soft?",
    help: "This checks for severe structural damage. When the inner protein structure of the hair is compromised, it loses its firmness and turns to mush when wet.",
    preparationTitle: "How to check wet texture",
    preparation: [
      "While hair is wet in the shower, gently pinch a small section of strands.",
      "Feel for an unusual texture—healthy wet hair feels solid, while compromised hair may feel mushy, gummy, or like wet cotton.",
      "Do not pull forcefully. If this only happens on bleached or highlighted sections, select that option."
    ],
    options: [
      { label: "No", scores: {} },
      { label: "Sometimes", scores: { P: 2, EL: 1 } },
      { label: "Often", scores: { P: 3, EL: 2 } },
      { label: "Only bleached areas", scores: { P: 2, HC: 2 } }
    ]
  },
  {
    id: "elasticity",
    prompt: "Gently stretch one wet shed strand. What happens?",
    help: "This is the classic elasticity test. It reveals the balance of moisture and protein within your hair shaft.",
    preparationTitle: "How to perform the stretch test",
    preparation: [
      "Find a single, already-shed strand of hair while you are washing or detangling wet hair.",
      "Hold an inch of the wet strand between your fingers and gently pull it taut, then release.",
      "Healthy hair will stretch slightly and bounce back. Damaged hair may snap immediately or stretch out like gum without returning.",
      "If you cannot test right now, choose 'Cannot test'."
    ],
    options: [
      { label: "Slight stretch and returns", scores: {} },
      { label: "Hardly stretches or snaps", scores: { M: 2, BR: 2 } },
      { label: "Stretches far and stays limp", scores: { P: 3, EL: 3 } },
      { label: "Cannot test", scores: {} }
    ]
  },
  {
    id: "proteinResponse",
    prompt: "After a protein or keratin treatment, what happens?",
    help: "Your hair's reaction to protein tells us if it needs structural reinforcement or if it simply needs softer moisture.",
    preparationTitle: "How to recall protein reactions",
    preparation: [
      "Think about your past experiences with products labeled 'protein treatment', 'keratin mask', or 'strengthening builder'.",
      "Did your hair feel significantly stronger and bouncier afterward?",
      "Did it feel stiff, hard, or like straw?",
      "If you have never used one or are unsure, choose 'Never used'."
    ],
    options: [
      { label: "Stronger and bouncier", scores: { P: 3 } },
      { label: "Hard or strawlike", scores: { M: 3 } },
      { label: "No clear change", scores: {} },
      { label: "Never used", scores: {} }
    ]
  },
  {
    id: "heatUse",
    prompt: "How often does hair touch hot tools?",
    help: "Heat exposure is one of the leading causes of length retention failure. Knowing your frequency helps us build a protective routine.",
    preparationTitle: "How to count heat exposure",
    preparation: [
      "Include blow dryers, flat irons, curling wands, and heated styling brushes.",
      "Count the total number of styling sessions per week where heat is applied.",
      "Even quick touch-ups or smoothing the edges count as a heat session."
    ],
    options: [
      { label: "Rarely", scores: {} },
      { label: "1–2 times per week", scores: { HC: 2 } },
      { label: "3+ times per week", scores: { HC: 3 } },
      { label: "Daily", scores: { HC: 4 } }
    ]
  },
  {
    id: "heatSigns",
    prompt: "Where are short rough pieces most visible?",
    help: "Identifying the location of broken pieces helps us confirm if mechanical or heat habits are the specific culprit.",
    preparationTitle: "How to locate breakage zones",
    preparation: [
      "Examine your dry hair in a mirror, looking at the top layer, the ends, and the hairline.",
      "Look for short, frizzy, or broken pieces that do not match the length of the rest of your hair.",
      "Notice if these pieces are concentrated where you use hot tools most (like the front pieces) or spread throughout."
    ],
    options: [
      { label: "Nowhere", scores: {} },
      { label: "Tool-contact areas", scores: { HC: 3, BR: 2 } },
      { label: "Ends throughout", scores: { BR: 2 } },
      { label: "Hairline or crown", scores: { ME: 2, BR: 2 } }
    ]
  },
  {
    id: "chemical",
    prompt: "Which service occurred in the last year?",
    help: "Chemical processes permanently alter the hair's structure, significantly increasing the need for targeted repair and specific handling.",
    preparationTitle: "How to identify chemical exposure",
    preparation: [
      "Think back over the last 12 months of salon visits or at-home treatments.",
      "Include hair color, highlights, bleach, relaxers, perms, or chemical straighteners.",
      "If you have had multiple services (e.g., color and a relaxer), choose 'Overlapping services'."
    ],
    options: [
      { label: "None", scores: {} },
      { label: "Deposit-only colour", scores: { HC: 1 } },
      { label: "Highlights or bleach", scores: { HC: 3, P: 2, HP: 1 } },
      { label: "Relaxer, perm, or straightener", scores: { HC: 3, P: 2 } },
      { label: "Overlapping services", scores: { HC: 4, BR: 2 } }
    ]
  },
  {
    id: "tension",
    prompt: "How often is hair pulled tight or carries added weight?",
    help: "Tension damages the follicle over time, leading to a specific type of hair loss called traction alopecia.",
    preparationTitle: "How to assess tension",
    preparation: [
      "Think about your typical daily hairstyles.",
      "Count days you wear slicked-back styles, tight ponytails, braids, buns, or hair extensions.",
      "Any style that pulls firmly on the scalp or adds heavy weight counts as tension."
    ],
    options: [
      { label: "Rarely", scores: {} },
      { label: "1–2 days per week", scores: { ME: 2 } },
      { label: "Most days", scores: { ME: 3 } },
      { label: "Continuously", scores: { ME: 4 } }
    ]
  },
  {
    id: "tensionSigns",
    prompt: "After styling, what happens at the scalp or hairline?",
    help: "These signs indicate your follicles are under dangerous stress, which must be addressed immediately to prevent permanent loss.",
    preparationTitle: "How to spot tension damage",
    preparation: [
      "Pay attention to how your scalp feels when you take your hair down at the end of the day.",
      "Look closely at your hairline and edges for tiny broken hairs, thinning, or redness.",
      "Any lingering soreness, bumps, or pain is a sign of excess tension."
    ],
    options: [
      { label: "Nothing", scores: {} },
      { label: "Temporary tightness", scores: { ME: 2 } },
      { label: "Broken edge hairs or bumps", scores: { ME: 3, BR: 2 } },
      { label: "Pain or thinning patches", scores: { ME: 3, RF: 3 } }
    ]
  },
  {
    id: "scalp",
    prompt: "Between washes, what best matches your scalp?",
    help: "Your scalp health dictates your hair growth. An inflamed, imbalanced scalp cannot produce strong, healthy hair.",
    preparationTitle: "How to observe scalp health",
    preparation: [
      "Think about how your scalp feels on a normal day, neither freshly washed nor overdue for a wash.",
      "Notice if it feels comfortably balanced, excessively oily, or uncomfortably tight and dry.",
      "If you experience itching, redness, burning, or visible sores, select the corresponding option."
    ],
    options: [
      { label: "Comfortable", scores: {} },
      { label: "Oily or coated", scores: { SC: 1, BU: 2 } },
      { label: "Dry flakes or tight", scores: { SC: 2 } },
      { label: "Itchy, red, or burning", scores: { SC: 3, RF: 1 } },
      { label: "Sores or crusting", scores: { RF: 4 } }
    ]
  },
  {
    id: "lossPattern",
    prompt: "Do you see distinct bare or thinning patches, or eyebrow loss?",
    help: "These patterns can flag underlying conditions that require a dermatologist rather than just a better product routine.",
    preparationTitle: "How to check for localized loss",
    preparation: [
      "Use a mirror to look over your entire scalp, parting the hair in different places.",
      "Look for specific coin-sized bare patches or areas that are suddenly much thinner than the rest.",
      "Note if you are also losing hair from your eyebrows or body."
    ],
    options: [
      { label: "No", scores: {} },
      { label: "One patch", scores: { RF: 4 } },
      { label: "Several patches", scores: { RF: 4 } },
      { label: "Eyebrows or body hair too", scores: { RF: 4 } }
    ]
  },
  {
    id: "shampooFrequency",
    prompt: "How often do you shampoo your scalp?",
    help: "Washing frequency impacts both scalp health and hair hydration. Striking the right balance is key to length retention.",
    preparationTitle: "How to count your wash days",
    preparation: [
      "Count only the days you use a lathering shampoo on your scalp.",
      "Do not count water-only rinses or days you only use conditioner (co-washing).",
      "Choose the average frequency that best represents your routine."
    ],
    options: [
      { label: "Daily or every other day", scores: {} },
      { label: "2–3 times per week", scores: {} },
      { label: "Weekly", scores: { BU: 1 } },
      { label: "Less than weekly", scores: { BU: 2 } }
    ]
  },
  {
    id: "consistency",
    prompt: "For four weeks, how often can you repeat a wash routine?",
    help: "The best routine is the one you will actually do. We want to ensure your recommendations fit your real life.",
    preparationTitle: "How to evaluate your consistency",
    preparation: [
      "Think realistically about your lifestyle, schedule, and energy levels.",
      "Consider how often you actually stick to your planned wash days versus skipping or delaying them.",
      "Choose the option that reflects your real-life habits, not your ideal goals."
    ],
    options: [
      { label: "Nearly every time", scores: {} },
      { label: "About half", scores: { CO: 2 } },
      { label: "Rarely", scores: { CO: 3 } },
      { label: "Schedule varies", scores: { CO: 2 } }
    ]
  }
];
