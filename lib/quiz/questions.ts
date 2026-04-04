export type QuizOption = {
    value: string;
    label: string;
    description?: string;
};

export type QuizQuestion = {
    id: string;
    question: string;
    hint?: string;
    type: 'single' | 'multi';
    options: QuizOption[];
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        id: 'hair_type',
        question: 'What is your hair type?',
        hint: 'Think about your natural texture when air-dried with no products.',
        type: 'single',
        options: [
            {
                value: 'straight',
                label: 'Straight',
                description: 'Lies flat, little to no wave',
            },
            {
                value: 'wavy',
                label: 'Wavy',
                description: 'S-shaped waves, not quite curly',
            },
            {
                value: 'curly',
                label: 'Curly',
                description: 'Defined ringlets or spirals',
            },
            {
                value: 'coily',
                label: 'Coily / Kinky',
                description: 'Tight coils or zig-zag pattern',
            },
        ],
    },
    {
        id: 'density',
        question: 'How would you describe your hair density?',
        hint: 'Density is how much hair you have, not how thick each strand is.',
        type: 'single',
        options: [
            {
                value: 'fine',
                label: 'Fine / Thin',
                description:
                    'Can easily see your scalp, hair feels lightweight',
            },
            {
                value: 'medium',
                label: 'Medium',
                description: 'Moderate amount, balanced feel',
            },
            {
                value: 'thick',
                label: 'Thick / Dense',
                description: 'Lots of hair, takes a long time to dry',
            },
        ],
    },
    {
        id: 'porosity',
        question: 'What is your hair porosity?',
        hint: "Porosity is how well your hair absorbs and retains moisture. If unsure, try the float test: drop a clean strand in water — if it sinks quickly it's high porosity, floats it's low.",
        type: 'single',
        options: [
            {
                value: 'low',
                label: 'Low porosity',
                description:
                    'Takes long to wet, products sit on top, slow to dry',
            },
            {
                value: 'medium',
                label: 'Medium / Normal porosity',
                description: 'Absorbs and retains moisture well',
            },
            {
                value: 'high',
                label: 'High porosity',
                description:
                    'Absorbs moisture quickly but dries out fast, often frizzy',
            },
            {
                value: 'unsure',
                label: 'Not sure',
                description: "I'll let the quiz decide",
            },
        ],
    },
    {
        id: 'scalp',
        question: 'How would you describe your scalp?',
        type: 'single',
        options: [
            {
                value: 'oily',
                label: 'Oily',
                description: 'Gets greasy within a day or two',
            },
            {
                value: 'dry',
                label: 'Dry / Flaky',
                description: 'Feels tight, itchy, or has flakes',
            },
            {
                value: 'balanced',
                label: 'Balanced',
                description: 'Not too oily or dry',
            },
            {
                value: 'sensitive',
                label: 'Sensitive',
                description: 'Easily irritated, prone to dandruff or buildup',
            },
        ],
    },
    {
        id: 'concerns',
        question: 'What are your main hair concerns?',
        type: 'multi',
        options: [
            { value: 'dryness', label: 'Dryness' },
            { value: 'frizz', label: 'Frizz' },
            { value: 'breakage', label: 'Breakage / Damage' },
            { value: 'growth', label: 'Hair growth / retention' },
            { value: 'thinning', label: 'Thinning / Shedding' },
            { value: 'color', label: 'Color-treated hair' },
            { value: 'volume', label: 'Lack of volume' },
            { value: 'dandruff', label: 'Dandruff / Scalp buildup' },
            { value: 'curl_definition', label: 'Curl definition' },
        ],
    },
    {
        id: 'wash_frequency',
        question: 'How often do you wash your hair?',
        type: 'single',
        options: [
            { value: 'daily', label: 'Daily' },
            { value: '2_3_week', label: '2–3 times a week' },
            { value: 'once_week', label: 'Once a week' },
            { value: 'less_weekly', label: 'Less than once a week' },
        ],
    },
    {
        id: 'heat_usage',
        question: 'How often do you use heat tools?',
        type: 'single',
        options: [
            {
                value: 'daily',
                label: 'Daily',
                description: 'Blow dryer, flat iron, curling iron',
            },
            { value: 'few_week', label: 'A few times a week' },
            { value: 'occasionally', label: 'Occasionally' },
            { value: 'never', label: 'Rarely or never' },
        ],
    },
    {
        id: 'chemical_processing',
        question: 'Is your hair chemically processed?',
        type: 'multi',
        options: [
            { value: 'color', label: 'Color / Highlights' },
            { value: 'bleach', label: 'Bleached or lightened' },
            { value: 'perm', label: 'Permed or relaxed' },
            { value: 'keratin', label: 'Keratin treatment' },
            { value: 'none', label: 'No chemical processing' },
        ],
    },
    {
        id: 'goal',
        question: 'What is your primary hair goal right now?',
        type: 'single',
        options: [
            { value: 'length_retention', label: 'Grow longer, retain length' },
            { value: 'health', label: 'Improve overall health and strength' },
            { value: 'moisture', label: 'Hydration and softness' },
            { value: 'style', label: 'Better styling and manageability' },
            { value: 'scalp', label: 'Scalp health' },
            { value: 'color_protection', label: 'Protect color-treated hair' },
        ],
    },
];
