// @ts-nocheck
/* The Growth Edit interactive logic — runs client-side only, called from useEffect */

export function initGrowthEdit(): () => void {
    /* ============================================================
   THE GROWTH EDIT — product catalog + routine logic
   PRO picks = Davines (professional / salon-grade)
   MATCH picks = comparable, more accessible professional brands
   Prices are approximate placeholders — edit freely.
   shop:'#' is a placeholder — drop in your ShopMy links.
   ============================================================ */

    /* repurchase = typical weeks a full-size lasts on a 2–4×/week routine.
   This powers the saved-list reminder timeline (your future app hook). */

    const PRODUCTS = {
        /* ---------- DAVINES · SHAMPOO ---------- */
        'dav-energizing-sham': {
            brand: 'Davines',
            name: 'NaturalTech Energizing Shampoo',
            price: '≈ $35',
            repurchase: 8,
            img: 'Davines Energizing Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2815777-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-27371596',
            why: 'Davines’ answer to thinning hair: a lightweight cleanse that energises the scalp and builds the healthiest possible environment for new growth.',
            ingredients:
                'Active principle from spinach extract + stinging nettle to stimulate microcirculation at the follicle; featherlight surfactants that rinse clean without residue.',
            howTo: 'Massage into a wet scalp for a full 60 seconds — that contact time is what boosts circulation — then rinse. Your main wash 3–4× a week.',
            avoid: 'Pair it with the matching leave-on Superactive to see results — washing alone leaves most of the benefit on the shower floor.',
        },
        'dav-rebalancing-sham': {
            brand: 'Davines',
            name: 'NaturalTech Rebalancing Shampoo',
            price: '≈ $40',
            repurchase: 8,
            img: 'Davines Rebalancing Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2815157-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66731048',
            why: 'Regulates an oily, congested scalp so roots stay fresh and clean for longer — without drying out the lengths.',
            ingredients:
                'A sulphur-based active + a lab-grown botanical complex that helps normalise sebum production.',
            howTo: 'Focus on the roots, let it sit 1–2 minutes, then rinse. 3–4× a week.',
            avoid: 'Over-washing actually triggers more oil — don’t exceed once a day.',
        },
        'dav-momo-sham': {
            brand: 'Davines',
            name: 'MOMO Moisturizing Shampoo',
            price: '≈ $32',
            repurchase: 8,
            img: 'Davines MOMO Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2817328-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-68366953',
            why: 'A deeply quenching cleanse for hair that drinks up moisture — Davines’ yellow-melon formula hydrates as it washes so lengths never feel stripped.',
            ingredients:
                'Yellow melon extract, rich in antioxidants, in a gentle low-strip surfactant base.',
            howTo: 'One lather concentrated on the lengths, leave a minute to soak in, then rinse.',
            avoid: 'Frequent washing re-strips dry hair — stretch your washes and refresh with dry shampoo in between.',
        },
        'dav-oi-sham': {
            brand: 'Davines',
            name: 'OI Shampoo',
            price: '≈ $43',
            repurchase: 8,
            img: 'Davines OI Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2817104-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-27370791',
            why: 'The cult all-rounder: Davines’ roucou-oil cleanse leaves balanced hair impossibly soft, glossy and easy to comb.',
            ingredients:
                'Roucou (annatto) oil, high in antioxidants, for softness, shine and silk-like slip.',
            howTo: 'Your everyday wash — lather, rinse, and repeat only if hair still feels heavy.',
            avoid: 'If your scalp runs oily, work a clarifying wash in midweek so softness doesn’t tip into greasiness.',
        },

        /* ---------- DAVINES · CONDITIONER ---------- */
        'dav-momo-cond': {
            brand: 'Davines',
            name: 'MOMO Moisturizing Conditioner',
            price: '≈ $43',
            repurchase: 8,
            img: 'Davines MOMO Conditioner',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2815710-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-68367319',
            why: 'Davines’ richest everyday conditioner — floods thirsty, dry and coily hair with slip and softness so it’s finally easy to detangle.',
            ingredients:
                'Yellow melon extract + nourishing emollients for deep, lasting moisture.',
            howTo: 'Work generously through the lengths, finger-detangle, leave 2–3 minutes, then rinse — or leave a little in if hair is very dry.',
            avoid: 'Concentrate on the lengths and ends, not the scalp, so roots stay clean between washes.',
        },
        'dav-oi-cond': {
            brand: 'Davines',
            name: 'OI Conditioner',
            price: '≈ $50',
            repurchase: 8,
            img: 'Davines OI Conditioner',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2815652-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66731205',
            why: 'Featherlight roucou-oil conditioner that brings mirror shine and slip to balanced hair without a hint of heaviness.',
            ingredients:
                'Roucou oil for softness and gloss that rinses perfectly clean.',
            howTo: 'Smooth through lengths and ends, leave a minute, then rinse.',
            avoid: 'It’s built to be weightless — if hair feels coated, you’re using more than you need.',
        },

        /* ---------- DAVINES · SCALP & TREATMENT ---------- */
        'dav-energizing-superactive': {
            brand: 'Davines',
            name: 'NaturalTech Energizing Superactive',
            price: '≈ $60',
            repurchase: 6,
            img: 'Davines Energizing Superactive',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2815744-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-27371775',
            why: 'The hero of any thinning routine — a leave-on tonic Davines designed to support hair through its active growth phase, week after week.',
            ingredients:
                'A concentrated spinach active + stinging nettle that energise the follicle and help prolong the growth cycle.',
            howTo: 'Part dry or towel-dried hair and massage straight onto the scalp. Don’t rinse. Weekly, or follow the vial schedule.',
            avoid: 'Results compound with consistency — skipping weeks quietly erases the progress you’ve banked.',
        },
        'dav-replumping-superactive': {
            brand: 'Davines',
            name: 'Replumping Hair Filler Superactive Leave-in',
            price: '≈ $62',
            repurchase: 6,
            img: 'Davines Replumping Superactive',
            imgUrl: 'https://us.davines.com/cdn/shop/files/Davines-71337-replumping-hair-filler-superactive-leave-in-100ml-8004608275411-1_2000x.jpg?v=1770669979',
            shop: 'https://go.shopmy.us/p-66764639',
            why: 'Refills weak, fragile strands from within so hair reads thicker, bouncier and more elastic — Davines’ fix for hair that’s lost its body.',
            ingredients:
                'A hyaluronic-acid–style filling complex that plumps the hair fibre.',
            howTo: 'Smooth onto damp lengths and leave in, then style as usual.',
            avoid: 'Apply before any oil or cream — layering oil first blocks the filler from absorbing.',
        },
        'dav-detox-scrub': {
            brand: 'Davines',
            name: 'NaturalTech Detoxifying Scrub Shampoo',
            price: '≈ $40',
            repurchase: 12,
            img: 'Davines Detoxifying Scrub',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2815132-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-67238589',
            why: 'A purifying scalp scrub that lifts the build-up, sweat and residue that quietly smother the follicle — essential when you have a lot of hair.',
            ingredients:
                'Natural exfoliating granules + purifying clay that decongest the scalp.',
            howTo: 'Once a week or as needed, massage into a wet scalp in place of shampoo, work in small circles, then rinse thoroughly.',
            avoid: 'Once a week is the ceiling — over-scrubbing strips the scalp’s barrier and triggers irritation.',
        },

        /* ---------- DAVINES · LEAVE-IN / BOND ---------- */
        /* ---------- DAVINES · LEAVE-IN CONDITIONER ---------- */
        'dav-momo-leavein': {
            brand: 'Davines',
            name: 'MOMO Moisturizing Leave-in Conditioner',
            price: '≈ $34',
            repurchase: 8,
            img: 'Davines MOMO Leave-in Conditioner',
            why: 'A true leave-in conditioner — spray it on after the shower for instant slip, easy detangling and a layer of weightless moisture that primes hair for everything that follows.',
            ingredients:
                'Yellow melon extract + lightweight conditioning agents for slip and hydration.',
            howTo: 'On towel-dried, damp hair, mist through mid-lengths to ends and comb through. No rinse.',
            avoid: 'Keep it off the scalp — this is for the lengths, where slip and detangling matter.',
        },
        'dav-oi-milk': {
            brand: 'Davines',
            name: 'OI All in One Milk',
            price: '≈ $40',
            repurchase: 8,
            img: 'Davines OI All in One Milk',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2817096-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66732986',
            why: 'A featherlight leave-in milk that gives fine hair slip and detangling after the shower without an ounce of weight — it also smooths frizz and adds shine.',
            ingredients:
                'A roucou-oil multi-benefit complex delivering slip, softness and shine.',
            howTo: 'Mist evenly over damp, towel-dried lengths and comb through. No rinse, safe daily.',
            avoid: 'Build it in light layers — too much at once can weigh fine hair down, so start with 1–2 pumps.',
        },
        'dav-melu-shield': {
            brand: 'Davines',
            name: 'MELU Hair Shield',
            price: '≈ $44',
            repurchase: 8,
            img: 'Davines MELU Hair Shield',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2815496-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-68367514',
            why: 'A true heat shield for every blow-dry and hot-tool session — seals the cuticle and guards against the breakage that heat and length cause.',
            ingredients:
                'A lengthening complex + a heat-protective film effective up to 215°C / 419°F.',
            howTo: 'Work or mist through damp mid-lengths and ends before blow-drying or using any hot tool.',
            avoid: 'Always apply before heat — adding it afterward does nothing — and focus on the ends where breakage lives.',
        },

        /* ---------- DAVINES · MASK ---------- */
        'dav-momo-mask': {
            brand: 'Davines',
            name: 'OI Hair Butter Mask',
            price: '≈ $20',
            repurchase: 10,
            img: 'Davines OI Hair Butter Mask',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2816965-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-68540954',
            why: 'A weekly butter mask that wraps hair in deep, cushioning moisture — leaves it silky-soft, luminous and dramatically easier to manage.',
            ingredients:
                'Roucou oil + OI complex for intense softness and shine.',
            howTo: 'Smooth through clean, damp lengths, leave 5–10 minutes, then rinse. Once a week.',
            avoid: 'Keep it to the lengths and ends — mask on the scalp can leave roots flat and greasy.',
        },
        'dav-nounou-mask': {
            brand: 'Davines',
            name: 'NOUNOU Nourishing Hair Mask',
            price: '≈ $45',
            repurchase: 10,
            img: 'Davines NOUNOU Mask',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2817237-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-68540346',
            why: 'A reconstructing rescue for very dry, over-processed or colour-damaged hair — rebuilds softness and strength exactly where hair is stressed.',
            ingredients:
                'Tomato extract + reconstructing lipids that repair and protect the fibre.',
            howTo: 'Apply to lengths and ends, leave 5–10 minutes, then rinse. Once weekly.',
            avoid: 'Target only where the damage is — there’s no benefit taking a repair mask up to healthy roots.',
        },
        'dav-melu-mask': {
            brand: 'Davines',
            name: 'MINU Hair Mask for Colored Hair',
            price: '≈ $40',
            repurchase: 10,
            img: 'Davines MINU Mask',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2985943-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-27371286',
            why: 'Strengthens long or fine hair against splitting and breakage — adds resilience without the weight that flattens delicate strands.',
            ingredients:
                'Spinach extract + a lengthening, bond-supporting complex.',
            howTo: 'Once a week from mid-lengths to ends, leave a few minutes, then rinse.',
            avoid: 'Don’t leave strengthening masks on for hours — too much protein can leave hair stiff rather than supple.',
        },

        /* ---------- GROWTH SUPPLEMENT (MaryRuth Organics) ---------- */
        'mr-hair': {
            brand: 'MaryRuth Organics',
            name: 'Hair Growth Vitamins',
            price: '≈ $30',
            repurchase: 4,
            img: 'MaryRuth Hair Growth Vitamins',
            imgUrl: 'https://cdn.shopify.com/s/files/1/0883/6750/files/liquid-morning-multivitamin-_-hair-growth-dragon-fruit-melon-30oz-maryruths.png',
            shop: 'https://go.shopmy.us/p-66757153',
            why: 'A gentle, vegan daily formula that supports growth from the inside — built on bioavailable vitamins rather than harsh actives.',
            ingredients:
                'Biotin, folate, zinc and vitamins A, C, D & E plus a supporting botanical blend.',
            howTo: 'Take daily as directed on the label, with food; give it 3+ months of consistency to judge results.',
            avoid: 'Not a substitute for scalp care or medical treatment — pair it with your topical routine and follow the label dosing.',
        },
        'mr-biotin': {
            brand: 'MaryRuth Organics',
            name: 'Biotin Gummies',
            price: '≈ $25',
            repurchase: 4,
            img: 'MaryRuth Biotin Gummies',
            imgUrl: 'https://cdn.shopify.com/s/files/1/0883/6750/files/Biotin_Gummies.png',
            shop: 'https://go.shopmy.us/p-66757602',
            why: 'A simple, budget-friendly vegan biotin gummy to support stronger strands and nails.',
            ingredients:
                'Biotin plus a light vitamin blend — vegan and non-GMO.',
            howTo: 'Two gummies daily with food; stay consistent over the months.',
            avoid: 'More biotin isn’t better — stick to the label dose and don’t stack it with other biotin products.',
        },

        /* ---------- DAVINES · STYLING / HEAT ---------- */
        'dav-volu-mist': {
            brand: 'Davines',
            name: 'VOLU Hair Mist',
            price: '≈ $30',
            repurchase: 8,
            img: 'Davines VOLU Mist',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2817278-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-68543829',
            why: 'A weightless volumizing mist that builds lasting lift at the roots — body you can brush through, not a stiff sprayed shell.',
            ingredients: 'Tara gum for buildable, brushable hold.',
            howTo: 'Mist at the roots of damp hair, then blow-dry flipped upside down for maximum lift.',
            avoid: 'Build it gradually — over-spraying crosses from full into crunchy.',
        },
        'dav-blowdry-primer': {
            brand: 'Davines',
            name: 'Your Hair Assistant Blowdry Primer',
            price: '≈ $44',
            repurchase: 8,
            img: 'Davines Blowdry Primer',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2816098-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66734383',
            why: 'Davines’ Your Hair Assistant primer cuts drying time, shields from heat and leaves a glassy, salon-smooth finish.',
            ingredients:
                'Heat-protective polymers + tara gum for a fast, smooth blow-dry.',
            howTo: 'Spray evenly over damp hair, let it absorb for a moment, then blow-dry.',
            avoid: 'Give it a few seconds to sink in before heat — blasting it soaking wet wastes the protection.',
        },
        'dav-love-smooth': {
            brand: 'Davines',
            name: 'LOVE Smoothing Primer',
            price: '≈ $36',
            repurchase: 8,
            img: 'Davines LOVE Smoothing',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2815769-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-68540699',
            why: 'Relaxes and de-frizzes coarse, unruly hair before styling for a sleeker, more polished, controlled finish.',
            ingredients:
                'An almond-extract smoothing complex that calms the cuticle.',
            howTo: 'On damp hair, work through mid-lengths to ends, then blow-dry smooth.',
            avoid: 'Keep it off the roots if you still want a little natural lift and movement up top.',
        },

        /* ---------- DAVINES · CURL CARE ---------- */
        'dav-love-curl-sham': {
            brand: 'Davines',
            name: 'LOVE Curl Enhancing Shampoo',
            price: '≈ $32',
            repurchase: 8,
            img: 'Davines LOVE Curl Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2986875-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-68368261',
            why: 'A gentle, hydrating curl cleanse that respects your pattern — washes without stripping the natural oils curls depend on.',
            ingredients:
                'Lentil-seed extract + a curl-defining complex; low-foam and sulfate-light.',
            howTo: 'Massage gently into the scalp and let the lather slip down the lengths; rinse. 1–2× a week.',
            avoid: 'Don’t scrub or pile hair up — rough handling roughens the cuticle and sparks frizz.',
        },
        'dav-love-curl-cond': {
            brand: 'Davines',
            name: 'LOVE Curl Enhancing Conditioner',
            price: '≈ $43',
            repurchase: 8,
            img: 'Davines LOVE Curl Conditioner',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2986826-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-68369149',
            why: 'Softens and defines curls with the slip you need to detangle without snapping fragile spirals.',
            ingredients:
                'Lentil-seed extract + rich emollients for definition and moisture.',
            howTo: 'Coat lengths and ends, finger-detangle while it’s in, leave 2–3 minutes, rinse most out.',
            avoid: 'If curls run dry, leave a little behind rather than rinsing every trace away.',
        },
        'dav-curl-serum': {
            brand: 'Davines',
            name: 'This Is A Curl Building Serum',
            price: '≈ $30',
            repurchase: 8,
            img: 'Davines Curl Building Serum',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2815959-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-67253446',
            why: 'The heart of a curl routine — a leave-in serum that builds soft, springy, defined curls with touchable, never-crunchy hold.',
            ingredients:
                'Film-forming curl polymers in a lightweight, moisturising base.',
            howTo: 'On soaking-wet hair, rake through and scrunch upward, then air-dry or diffuse on low.',
            avoid: 'Apply to soaking-wet — not towel-dry — hair, or curls clump and dry unevenly.',
        },
        'dav-curl-mousse': {
            brand: 'Davines',
            name: 'This Is A Curl Moisturizing Mousse',
            price: '≈ $30',
            repurchase: 8,
            img: 'Davines Curl Mousse',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2815991-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-67238437',
            why: 'A weightless mousse that defines waves and curls while adding moisture and bounce — definition without the crunch.',
            ingredients:
                'A conditioning curl complex in an airy, brushable foam.',
            howTo: 'Scrunch into wet hair from the ends up, then diffuse on low or air-dry.',
            avoid: 'Resist touching it while it dries — scrunch out any cast only once hair is fully dry.',
        },
        'dav-oi-oil': {
            brand: 'Davines',
            name: 'OI Oil Absolute Beautifying Potion',
            price: '≈ $57',
            repurchase: 12,
            img: 'Davines OI Oil',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2817112-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66735292',
            why: 'A luxurious finishing oil that seals in moisture, tames frizz and lays a glassy shine over any hair type — and the sealing “O” of the LOC method for curls and coils.',
            ingredients:
                'Roucou oil, rich in antioxidants, for slip, shine and protection.',
            howTo: 'Warm a few drops in your palms and smooth over damp or dry ends to seal and shine.',
            avoid: 'A few drops is plenty, concentrated on the ends — too much oil weighs hair down and dulls shine.',
        },

        /* ============================================================
     ACCESSIBLE PROFESSIONAL MATCHES
     ============================================================ */

        /* SHAMPOO */
        'm-actacre-sham': {
            brand: 'Act+Acre',
            name: 'Cold Processed Stem Cell Shampoo',
            price: '≈ $55',
            repurchase: 8,
            img: 'Act+Acre Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2830420-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66765111',
            why: 'A clean, scalp-first cleanse that supports a healthy growth environment for less.',
            ingredients:
                'Apple stem cells, basil + vitamin E to nourish the follicle.',
            howTo: 'Massage into the scalp, leave a moment, rinse. 3–4× weekly.',
            avoid: 'Let the scalp adjust over a few washes before judging the results.',
        },
        'm-verb-ghost-sham': {
            brand: 'Verb',
            name: 'Ghost Shampoo',
            price: '≈ $20',
            repurchase: 8,
            img: 'Verb Ghost Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s1984996-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66764150',
            why: 'Weightless, everyday softness and shine for balanced hair.',
            ingredients: 'Moringa oil + hydrolyzed quinoa.',
            howTo: 'Daily-safe lather, rinse.',
            avoid: 'A simple, reliable wash — nothing to flag.',
        },
        'm-briogeo-moist-sham': {
            brand: 'Briogeo',
            name: 'Don’t Despair, Repair! Shampoo',
            price: '≈ $28',
            repurchase: 8,
            img: 'Briogeo Repair Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2030666-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-68373906',
            why: 'A creamy, sulfate-free moisture wash for dry, coarse hair.',
            ingredients: 'Rosehip oil, algae extract + B-vitamins.',
            howTo: 'Gentle lather concentrated on the lengths, rinse.',
            avoid: 'Pair with its matching conditioner — don’t re-strip with a clarifier.',
        },

        /* CONDITIONER */
        'm-verb-ghost-cond': {
            brand: 'Verb',
            name: 'Ghost Conditioner',
            price: '≈ $20',
            repurchase: 8,
            img: 'Verb Ghost Conditioner',
            imgUrl: 'https://www.sephora.com/productimages/sku/s1985001-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66764243',
            why: 'Lightweight slip and shine for balanced, medium hair.',
            ingredients: 'Moringa oil + hydrolyzed quinoa.',
            howTo: 'Lengths and ends, rinse after a minute.',
            avoid: 'Easy and weightless — nothing to flag.',
        },
        'm-briogeo-moist-cond': {
            brand: 'Briogeo',
            name: 'Don’t Despair, Repair! Super Moisture Conditioner',
            price: '≈ $39',
            repurchase: 8,
            img: 'Briogeo Repair Conditioner',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2424265-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66754110',
            why: 'Rich, sulfate-free moisture that softens coarse, dry lengths.',
            ingredients: 'Rosehip oil, algae + B-vitamins.',
            howTo: 'Saturate lengths, comb through, leave 2–3 minutes, rinse.',
            avoid: 'Rinse well — it’s a rich formula, so a little goes a long way on the lengths.',
        },

        /* SCALP & TREATMENT */
        'm-ordinary-serum': {
            brand: 'The Ordinary',
            name: 'Multi-Peptide Serum for Hair Density',
            price: '≈ $24',
            repurchase: 8,
            img: 'The Ordinary Hair Serum',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2210722-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66755166',
            why: 'A peptide scalp serum that visibly supports density for a fraction of the price.',
            ingredients: 'Hair-targeting peptide complex + caffeine.',
            howTo: 'Massage into a dry or damp scalp daily; leave in, don’t rinse.',
            avoid: 'Give it 8–12 weeks of daily use — peptides work slowly.',
        },
        'm-actacre-serum': {
            brand: 'Act+Acre',
            name: 'Cold Processed Scalp Serum',
            price: '≈ $55',
            repurchase: 8,
            img: 'Act+Acre Scalp Serum',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2830420-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66765111',
            why: 'A lightweight leave-in serum that strengthens and balances the scalp.',
            ingredients: 'Plant-based peptides + nourishing oils.',
            howTo: 'Apply a few drops to the scalp and massage in; leave on.',
            avoid: 'A little goes a long way — too much can feel greasy.',
        },
        'm-briogeo-scalp-scrub': {
            brand: 'Briogeo',
            name: 'Scalp Revival Charcoal Scrub',
            price: '≈ $42',
            repurchase: 12,
            img: 'Briogeo Scalp Scrub',
            imgUrl: 'https://www.sephora.com/productimages/sku/s1895580-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-67238709',
            why: 'A gentle exfoliating scrub that clears build-up and soothes flaking.',
            ingredients: 'Binchotan charcoal + tea-tree and peppermint oils.',
            howTo: 'Massage into the scalp once weekly, then rinse.',
            avoid: 'Weekly is plenty — daily scrubbing irritates the scalp.',
        },

        /* HEAT · OIL — accessible matches */
        'm-its-a-10': {
            brand: 'It’s a 10',
            name: 'Miracle Leave-In Spray',
            price: '≈ $23',
            repurchase: 8,
            img: 'It’s a 10 Miracle Leave-In',
            imgUrl: 'https://cdn.shopify.com/s/files/1/1737/7579/files/Conditioning_Leave_in_4oz.jpg',
            shop: 'https://go.shopmy.us/p-67238862',
            why: 'The cult spray leave-in conditioner — detangles, softens, smooths frizz and adds shine in a few quick mists.',
            ingredients: 'Silk proteins, panthenol + conditioning botanicals.',
            howTo: 'Mist over damp hair from mid-lengths to ends before styling. No rinse, safe daily.',
            avoid: 'A few mists is plenty — layer lightly so finer hair doesn’t go limp.',
        },
        'm-amika-blockade': {
            brand: 'amika',
            name: 'Blockade Heat Defense Serum',
            price: '≈ $30',
            repurchase: 8,
            img: 'amika Blockade Heat Serum',
            imgUrl: 'https://is4.revolveassets.com/images/p4/n/z/AIKA-WU69_V1.jpg',
            shop: 'https://go.shopmy.us/p-67239062',
            why: 'A lightweight heat-protectant serum that shields hair up to 450°F while smoothing frizz and boosting shine.',
            ingredients:
                'A bond-protecting complex + rice protein for thermal defence.',
            howTo: 'Smooth a few drops through damp or dry hair before any hot tool.',
            avoid: 'Always apply before heat — adding it after styling protects nothing.',
        },
        'm-moroccanoil': {
            brand: 'Moroccanoil',
            name: 'Moroccanoil Treatment',
            price: '≈ $34',
            repurchase: 12,
            img: 'Moroccanoil Treatment',
            imgUrl: 'https://www.sephora.com/productimages/sku/s1869478-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-46828494',
            why: 'The iconic argan-oil finishing treatment — seals the cuticle, tames frizz and leaves a glassy, healthy shine.',
            ingredients:
                'Argan oil + linseed extract, rich in antioxidants and fatty acids.',
            howTo: 'Warm a few drops and smooth through damp or dry ends to seal and shine.',
            avoid: 'Keep it to the ends — too much, too high up looks greasy on finer hair.',
        },

        /* MASK */
        'm-briogeo-mask': {
            brand: 'Briogeo',
            name: 'Don’t Despair, Repair! Deep Conditioning Mask',
            price: '≈ $38',
            repurchase: 10,
            img: 'Briogeo Repair Mask',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2030674-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66753964',
            why: 'A rich, sulfate-free weekly mask that deeply moisturises and strengthens stressed hair.',
            ingredients: 'Rosehip oil, algae extract, B-vitamins + biotin.',
            howTo: 'Apply to clean damp hair, leave 5–10 minutes, rinse. Once weekly.',
            avoid: 'Concentrate on lengths and ends, off the scalp, so roots don’t go limp.',
        },

        /* STYLING / HEAT */
        'm-livingproof-volume': {
            brand: 'Living Proof',
            name: 'Full Dry Volume & Texture Spray',
            price: '≈ $30',
            repurchase: 8,
            img: 'Living Proof Volume Spray',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2556967-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66755635',
            why: 'Buildable, weightless volume and grip for fine hair.',
            ingredients: 'Patented thickening + texturizing polymers.',
            howTo: 'Spray into dry roots and lengths, then tousle.',
            avoid: 'Shake well and mist lightly — over-application gets chalky.',
        },
        'm-colorwow-dreamcoat': {
            brand: 'Color Wow',
            name: 'Dream Coat Anti-Frizz Spray',
            price: '≈ $28',
            repurchase: 10,
            img: 'Color Wow Dream Coat',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2437267-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66755775',
            why: 'A heat-activated treatment that seals out humidity and frizz for days.',
            ingredients: 'Heat-responsive smoothing polymers.',
            howTo: 'Spray on damp hair, then blow-dry to activate the seal.',
            avoid: 'It must be heat-activated — air-drying won’t switch it on.',
        },

        /* CURL CARE — accessible matches */
        'm-briogeo-curl-sham': {
            brand: 'Briogeo',
            name: 'Curl Charisma Cleansing Shampoo',
            price: '≈ $28',
            repurchase: 8,
            img: 'Briogeo Curl Charisma Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2146041-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66754246',
            why: 'A clean, sulfate-free curl cleanse that hydrates while it washes.',
            ingredients:
                'Rice amino acids, tomato-fruit ferment + avocado oil.',
            howTo: 'Gentle lather at the scalp, rinse. 1–2× weekly.',
            avoid: 'Keep washes infrequent — curls dry out with frequent shampooing.',
        },
        'm-briogeo-curl-cond': {
            brand: 'Briogeo',
            name: 'Curl Charisma Conditioner',
            price: '≈ $28',
            repurchase: 8,
            img: 'Briogeo Curl Charisma Conditioner',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2146058-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66754351',
            why: 'Slip-rich, sulfate-free conditioning for easy detangling and definition.',
            ingredients: 'Rice amino acids, quinoa protein + shea butter.',
            howTo: 'Coat the lengths, finger-detangle, then rinse most of it out.',
            avoid: 'Leave a little in if your curls run dry — don’t strip all the slip.',
        },
        'm-curl-cream': {
            brand: 'SheaMoisture',
            name: 'Coconut & Hibiscus Curl Smoothie',
            price: '≈ $13',
            repurchase: 6,
            img: 'SheaMoisture Curl Smoothie',
            imgUrl: 'https://m.media-amazon.com/images/I/717VqelOLNL._SL1500_.jpg',
            shop: 'https://go.shopmy.us/p-66758420',
            why: 'A rich, affordable curl cream that defines and softens thirsty curls and coils.',
            ingredients: 'Coconut oil, shea butter + silk protein.',
            howTo: 'Rake through soaking-wet hair, scrunch, then air-dry or diffuse.',
            avoid: 'Can build up — clarify every few weeks if curls start to feel coated.',
        },
        'm-leavein-curl': {
            brand: 'Kinky-Curly',
            name: 'Knot Today Leave-In Detangler',
            price: '≈ $35',
            repurchase: 8,
            img: 'Kinky-Curly Knot Today',
            imgUrl: 'https://m.media-amazon.com/images/I/51NkoluFGJL._SL1500_.jpg',
            shop: 'https://go.shopmy.us/p-66758078',
            why: 'A cult leave-in detangler that softens and preps curls and coils for styling.',
            ingredients: 'Slippery elm, marshmallow root + organic mango.',
            howTo: 'On soaking-wet hair, smooth through, detangle, then layer your styler on top.',
            avoid: 'Apply to very wet hair for the most slip — it grips on dry hair.',
        },

        /* ============================================================
     DAVINES — DEDE (fine/lightweight moisture), MINU (colour), HEART OF GLASS (blonde)
     ============================================================ */
        'dav-dede-sham': {
            brand: 'Davines',
            name: 'DEDE Delicate Shampoo',
            price: '≈ $32',
            repurchase: 8,
            img: 'Davines DEDE Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2815579-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-68367704',
            why: 'Davines’ most delicate daily cleanse — feeds lightweight moisture and softness into fine, fragile hair without an ounce of weight, so it stays bouncy but stops snapping.',
            ingredients:
                'A lightweight muskmelon extract + gentle cleansers that hydrate as they wash.',
            howTo: 'Lather gently at the scalp and through the lengths, then rinse. Your everyday wash.',
            avoid: 'Skip heavy butters at the root afterward — DEDE keeps fine hair light, and oils there undo it.',
        },
        'dav-dede-cond': {
            brand: 'Davines',
            name: 'DEDE Delicate Conditioner',
            price: '≈ $32',
            repurchase: 8,
            img: 'Davines DEDE Conditioner',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2815561-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-68540265',
            why: 'A feather-light conditioner that softens and detangles fine hair while feeding in the moisture that prevents the dryness-driven breakage fine hair is prone to.',
            ingredients: 'Muskmelon extract + lightweight conditioning agents.',
            howTo: 'Mid-lengths to ends, leave a minute, then rinse.',
            avoid: 'Keep it off the scalp so fine roots stay lifted.',
        },
        'dav-minu-sham': {
            brand: 'Davines',
            name: 'MINU Shampoo',
            price: '≈ $36',
            repurchase: 8,
            img: 'Davines MINU Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2817005-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-68369604',
            why: 'Davines’ colour-protecting cleanse — locks in your tone and adds illuminating shine while it gently washes, so colour stays vibrant far longer.',
            ingredients:
                'Goji-berry extract, rich in antioxidants, to shield colour from fading.',
            howTo: 'Gentle lather, rinse. Your everyday colour-safe wash.',
            avoid: 'Steer clear of harsh clarifying shampoos that strip colour between washes.',
        },
        'dav-minu-cond': {
            brand: 'Davines',
            name: 'MINU Conditioner',
            price: '≈ $43',
            repurchase: 8,
            img: 'Davines MINU Conditioner',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2815454-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-27371287',
            why: 'Seals the cuticle to hold colour true and leaves hair glossy, soft and protected against fade.',
            ingredients: 'Goji-berry antioxidant complex.',
            howTo: 'Lengths and ends, leave a minute, then rinse.',
            avoid: 'A colour-safe finish — concentrate it on the lengths.',
        },
        'dav-heart-sham': {
            brand: 'Davines',
            name: 'Heart of Glass Silkening Shampoo',
            price: '≈ $38',
            repurchase: 8,
            img: 'Davines Heart of Glass Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2815348-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-68370676',
            why: 'Davines’ blonde-hair hero — a silkening cleanse that deeply moisturises fragile, lightened hair, strengthens it against breakage and keeps brass in check.',
            ingredients:
                'Roucou oil + blue-toning pigments and strengthening proteins for blonde hair.',
            howTo: 'Lather gently, leave a minute to tone, then rinse. 2–3× a week.',
            avoid: 'Don’t use the toning pigments daily — a couple of times a week keeps blonde bright, not dull or grey.',
        },
        'dav-heart-cond': {
            brand: 'Davines',
            name: 'Heart of Glass Rich Conditioner',
            price: '≈ $50',
            repurchase: 8,
            img: 'Davines Heart of Glass Conditioner',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2973022-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66731407',
            why: 'A rich, strengthening conditioner that floods dry blonde hair with moisture and smooths it for glassy, breakage-free shine.',
            ingredients: 'Roucou oil + bond-supporting proteins.',
            howTo: 'Lengths and ends, leave 2–3 minutes, then rinse.',
            avoid: 'Focus on the lengths where lightened blonde is most porous and fragile.',
        },

        /* MOISTURE / COLOUR / BLONDE — accessible matches */
        'm-verb-hydra-sham': {
            brand: 'Verb',
            name: 'Hydrating Shampoo',
            price: '≈ $20',
            repurchase: 8,
            img: 'Verb Hydrating Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2790657-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66754943',
            why: 'A lightweight, plant-based moisture cleanse that hydrates fine hair without weighing it down.',
            ingredients: 'Hydrating glycoproteins + aloe.',
            howTo: 'Lather, rinse. Everyday-safe.',
            avoid: 'Keep heavy oils off the roots to preserve body.',
        },
        'm-verb-hydra-cond': {
            brand: 'Verb',
            name: 'Hydrating Conditioner',
            price: '≈ $20',
            repurchase: 8,
            img: 'Verb Hydrating Conditioner',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2790640-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66755014',
            why: 'Light moisture and slip that softens fine hair and guards against breakage.',
            ingredients: 'Aloe + conditioning glycoproteins.',
            howTo: 'Mid-lengths to ends, rinse.',
            avoid: 'Stay off the scalp to keep roots lifted.',
        },
        'm-pureology-sham': {
            brand: 'Pureology',
            name: 'Hydrate Shampoo',
            price: '≈ $34',
            repurchase: 8,
            img: 'Pureology Hydrate Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2390755-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66755998',
            why: 'A sulfate-free, colour-safe moisture cleanse that protects tone while it hydrates.',
            ingredients: 'Coconut + camelina oils in a colour-protecting base.',
            howTo: 'Gentle lather, rinse.',
            avoid: 'Sulfate-free by design — don’t alternate with a stripping clarifier.',
        },
        'm-pureology-cond': {
            brand: 'Pureology',
            name: 'Hydrate Conditioner',
            price: '≈ $36',
            repurchase: 8,
            img: 'Pureology Hydrate Conditioner',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2390771-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66756025',
            why: 'Colour-safe moisture that seals the cuticle for vibrancy and shine.',
            ingredients: 'Camelina oil + antioxidants.',
            howTo: 'Lengths and ends, rinse.',
            avoid: 'A colour-safe finish — concentrate on the lengths.',
        },
        'm-blonde-sham': {
            brand: 'Pureology',
            name: 'Strength Cure Blonde Shampoo',
            price: '≈ $34',
            repurchase: 8,
            img: 'Pureology Blonde Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2390912-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66756218',
            why: 'A purple, bond-strengthening cleanse that tones brass and rebuilds fragile, lightened blonde hair.',
            ingredients: 'Purple pigments + a bonding complex and keratin.',
            howTo: 'Lather, leave 1–2 minutes to tone, then rinse. 2–3× a week.',
            avoid: 'Don’t leave purple shampoo on too long or too often — it can over-tone to grey.',
        },
        'm-blonde-cond': {
            brand: 'Pureology',
            name: 'Strength Cure Blonde Conditioner',
            price: '≈ $36',
            repurchase: 8,
            img: 'Pureology Blonde Conditioner',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2391126-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-66756244',
            why: 'A strengthening, deeply moisturising conditioner for dry, lightened blonde hair.',
            ingredients: 'A bonding complex + shea and keratin.',
            howTo: 'Lengths and ends, leave 2–3 minutes, then rinse.',
            avoid: 'Concentrate on the porous lengths and ends.',
        },

        /* ---------- DAVINES · VOLUME MOUSSE ---------- */
        'dav-volume-mousse': {
            brand: 'Davines',
            name: 'This Is A Volume Boosting Mousse',
            price: '≈ $30',
            repurchase: 8,
            img: 'Davines Volume Boosting Mousse',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2816056-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-67239150',
            why: 'A volumizing mousse built for fine hair — builds lasting, touchable body from roots to ends without the stiffness of a spray or the weight that drags fine strands down.',
            ingredients:
                'Volumizing polymers in a lightweight conditioning foam base.',
            howTo: 'Rake or scrunch through damp hair from roots to ends, then blow-dry for full, bouncy results.',
            avoid: 'Start golf-ball-sized and work through quickly — too much stacks on weight instead of volume.',
        },

        /* ---------- BUMBLE AND BUMBLE · SHAMPOO ---------- */
        'm-bb-gentle-sham': {
            brand: 'Bumble and bumble',
            name: 'Gentle Shampoo',
            price: '≈ $36',
            repurchase: 8,
            img: 'Bumble and bumble Gentle Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s1270065-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-67239305',
            why: 'A mild, moisturizing daily cleanse gentle enough for everyday washing — clean without stripping, with enough moisture to support fine hair’s real need for hydration.',
            ingredients:
                'Moisturizing and conditioning agents in an ultra-gentle surfactant base.',
            howTo: 'Lather gently, rinse. Everyday-safe.',
            avoid: 'Keep heavier oils off the roots after washing to preserve body.',
        },
        'm-bb-hio-sham': {
            brand: 'Bumble and bumble',
            name: 'Hairdresser’s Invisible Oil Hydrating Shampoo',
            price: '≈ $38',
            repurchase: 8,
            img: 'Bumble and bumble Hairdresser’s Invisible Oil Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s1602945-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-67239724',
            why: 'A frizz-fighting, hydrating shampoo infused with a featherlight 6-oil blend — washes hair clean while depositing real moisture and shine without a trace of heaviness.',
            ingredients:
                'A featherlight 6-oil blend with frizz-reducing and hydrating agents.',
            howTo: 'Lather from roots to ends, rinse. Everyday-safe.',
            avoid: 'If hair still feels dry, lean into the conditioner and mask.',
        },
        'm-bb-bond-sham': {
            brand: 'Bumble and bumble',
            name: 'Bond-Building Repair Shampoo',
            price: '≈ $38',
            repurchase: 8,
            img: 'Bumble and bumble Bond-Building Repair Shampoo',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2556850-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-67240048',
            why: 'A bond-building daily shampoo that repairs and strengthens highlighted or chemically processed hair — cleanses while rebuilding exactly what bleaching breaks down.',
            ingredients:
                'Bond-repairing actives and strengthening agents in a gentle cleanser.',
            howTo: 'Lather gently, leave a minute, rinse. Use 2—3× a week alternating with your toning shampoo.',
            avoid: 'Alternate with Heart of Glass — daily toning shampoo flattens colour dimension over time.',
        },

        /* ---------- BUMBLE AND BUMBLE · CONDITIONER ---------- */
        'm-bb-hio-cond': {
            brand: 'Bumble and bumble',
            name: 'Hairdresser’s Invisible Oil Hydrating Conditioner',
            price: '≈ $38',
            repurchase: 8,
            img: 'Bumble and bumble Hairdresser’s Invisible Oil Conditioner',
            imgUrl: 'https://www.sephora.com/productimages/sku/s1602952-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-67239859',
            why: 'Frizz-reducing hydration with the same featherlight 6-oil complex — slip, softness and shine without any weight.',
            ingredients: '6-oil featherlight blend plus conditioning agents.',
            howTo: 'Mid-lengths to ends, leave a minute, rinse.',
            avoid: 'Keep it off the scalp to maintain root lift and volume.',
        },
        'm-bb-bond-cond': {
            brand: 'Bumble and bumble',
            name: 'Bond-Building Repair Conditioner',
            price: '≈ $38',
            repurchase: 8,
            img: 'Bumble and bumble Bond-Building Repair Conditioner',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2556868-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-67240106',
            why: 'A reparative daily conditioner that rebuilds broken bonds in fragile blonde hair — restoring the strength, elasticity and shine that bleaching strips away.',
            ingredients:
                'Bond-building and strengthening complex in a rich conditioning base.',
            howTo: 'Lengths and ends, leave 2—3 minutes, rinse.',
            avoid: 'Focus on the porous mid-lengths and ends where lightening has done the most damage.',
        },

        /* ---------- BUMBLE AND BUMBLE · MOUSSE ---------- */
        'm-bb-mousse': {
            brand: 'Bumble and bumble',
            name: 'Thickening Full Form Mousse',
            price: '≈ $32',
            repurchase: 8,
            img: 'Bumble and bumble Thickening Full Form Mousse',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2126688-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-67240247',
            why: 'A pro-brand volume mousse that lifts and thickens fine strands with lasting, touchable body — the soft, brushable finish that spray products cannot match.',
            ingredients:
                'Thickening and volumizing polymers in a lightweight foam.',
            howTo: 'Rake or scrunch through damp roots and lengths, then blow-dry for full, bouncy volume.',
            avoid: 'Apply to damp hair only — working mousse into dry hair gets clumpy and uneven.',
        },

        /* ---------- IT’S A 10 · KERATIN ---------- */
        'm-its-a-10-keratin': {
            brand: 'It’s a 10',
            name: 'Miracle Leave-In Plus Keratin',
            price: '≈ $23',
            repurchase: 8,
            img: 'It’s a 10 Miracle Leave-In Plus Keratin',
            imgUrl: 'https://cdn.shopify.com/s/files/1/1737/7579/files/Keratin_Leave-in_4oz_1e4c4973-8483-4394-8ee5-cc9c80295993.jpg',
            shop: 'https://go.shopmy.us/p-67238901',
            why: 'The keratin version of the cult leave-in — keratin physically smooths and seals the raised cuticle so fine hair locks in the moisture and protein that would otherwise escape. This is the step that turns growth into retained length.',
            ingredients:
                'Keratin plus silk proteins, panthenol and conditioning botanicals.',
            howTo: 'Mist over damp — not soaking-wet — hair from mid-lengths to ends before styling. No rinse, safe daily.',
            avoid: 'Apply to damp hair, not soaking-wet — too much water dilutes the keratin before it can seal the cuticle.',
        },

        /* ---------- MOROCCANOIL · BLONDE SAFE ---------- */
        'm-moroccanoil-light': {
            brand: 'Moroccanoil',
            name: 'Moroccanoil Treatment Light',
            price: '≈ $34',
            repurchase: 12,
            img: 'Moroccanoil Treatment Light',
            imgUrl: 'https://www.sephora.com/productimages/sku/s1869502-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-67240521',
            why: 'The iconic argan treatment in a clear, tint-free version made specifically for blonde, fine and light-coloured hair — all the seal-and-shine with zero risk of the amber deposit the original leaves on light hair.',
            ingredients:
                'Clear argan oil plus linseed extract, rich in antioxidants and fatty acids.',
            howTo: 'Warm a few drops and smooth over damp or dry ends to seal and shine.',
            avoid: 'Keep it to the ends — Light is clear but still oil, so too much up high reads greasy on fine hair.',
        },
        'm-moroccanoil-violet': {
            brand: 'Moroccanoil',
            name: 'Moroccanoil Violet Oil',
            price: '≈ $34',
            repurchase: 12,
            img: 'Moroccanoil Violet Oil',
            imgUrl: 'https://www.sephora.com/productimages/sku/s2771947-main-zoom.jpg?imwidth=465',
            shop: 'https://go.shopmy.us/p-67240705',
            why: 'A toning version of the iconic treatment — argan oil with violet pigment that neutralizes yellow tones and keeps blonde bright between salon visits, all while sealing the cuticle.',
            ingredients:
                'Argan oil plus violet toning pigments and antioxidant fatty acids.',
            howTo: 'A few drops smoothed over damp or dry ends. Use 1—2× a week for toning, not every wash.',
            avoid: '1—2× a week is all you need — daily violet oil builds up pigment fast and turns bright blonde flat and dull.',
        },
    };

    /* ============================================================
   ROUTINE BUILDER — texture × density → 7-step regimen
   ============================================================ */

    const TEXTURES = {
        fine: {
            label: 'Fine',
            desc: 'Strands feel thread-like and silky; hair goes flat and can look oily quickly.',
        },
        medium: {
            label: 'Medium',
            desc: 'The balanced middle — holds a style, neither fragile nor wiry.',
        },
        coarse: {
            label: 'Coarse',
            desc: 'Strands feel thick and strong; hair tends to dryness and frizz.',
        },
    };
    const DENSITIES = {
        thin: {
            label: 'Thin',
            desc: 'You can see scalp easily; a ponytail feels slim. Growth & density come first.',
        },
        medium: {
            label: 'Medium',
            desc: 'A moderate amount of hair — neither sparse nor especially full.',
        },
        dense: {
            label: 'Dense',
            desc: 'A lot of hair packed in; styling and manageability are the focus.',
        },
    };
    const PATTERNS = {
        straight: {
            label: 'Straight',
            desc: 'No natural bend. Shine travels easily, but roots turn oily fast and volume falls flat.',
        },
        wavy: {
            label: 'Wavy',
            desc: 'Soft S-bends. Prone to frizz; wants definition without weighing the wave down.',
        },
        curly: {
            label: 'Curly',
            desc: 'Defined ringlets or spirals. Naturally dry and thirsty for moisture.',
        },
        coily: {
            label: 'Coily',
            desc: 'Tight coils, zig-zags or kinks — the driest, most fragile pattern. Moisture is everything.',
        },
    };
    const HAIRSTATUS = {
        natural: {
            label: 'Natural',
            desc: 'Uncoloured or grown-out — no colour to protect.',
        },
        color: {
            label: 'Colour-treated',
            desc: 'Dyed or glossed — wants colour protection plus extra moisture.',
        },
        blonde: {
            label: 'Blonde / Lightened',
            desc: 'Bleached or highlighted — the most fragile; craves moisture, bond and tone.',
        },
    };
    const STATUS_COPY = {
        natural: '',
        color: ' And because it’s colour-treated, your cleanse and conditioner switch to Davines MINU to lock in tone and shine while you grow it out.',
        blonde: ' And because it’s blonde or lightened, your cleanse and conditioner switch to Davines Heart of Glass — deep moisture and bond strength to stop the breakage that dryness causes in lightened hair.',
    };
    const PATTERN_COPY = {
        straight: {
            priority: 'Light & lifted',
            clause: 'Because your hair is straight, natural oils slide down the strand fast — so your edit stays light and lifted, with smoothing to finish.',
        },
        wavy: {
            priority: 'Define & de-frizz',
            clause: 'Your waves want definition without weight, so the routine adds frizz control and curl-enhancing styling to coax out your natural pattern.',
        },
        curly: {
            priority: 'Moisture & definition',
            clause: 'Curls run dry because oils can’t travel down the spiral — so your edit leans into gentle cleansing, deep moisture and curl-defining leave-ins.',
        },
        coily: {
            priority: 'Max moisture & protect',
            clause: 'Coily hair is the most moisture-hungry and fragile of all, so your edit centres on rich hydration, sealing oils and ultra-gentle, low-wash handling.',
        },
    };

    const PROFILE_COPY = {
        'fine-thin': {
            name: 'Fine & Thin',
            blurb: 'Delicate strands and a sparse density — the combination most prone to looking flat and showing scalp. Your edit leads with growth support and scalp health, then builds weightless volume on top.',
        },
        'fine-medium': {
            name: 'Fine & Medium',
            blurb: 'Silky, delicate strands with a healthy amount of hair. The goal is lift and body without anything heavy that would drag your roots down by lunchtime.',
        },
        'fine-dense': {
            name: 'Fine & Dense',
            blurb: 'Lots of fine strands — full but quick to fall flat and turn oily at the roots. Your edit keeps things light and lifted while balancing the scalp.',
        },
        'medium-thin': {
            name: 'Medium & Thin',
            blurb: 'Balanced strands over a sparse density. Growth and density take the lead, supported by gentle, weightless moisture that won’t flatten the lift.',
        },
        'medium-medium': {
            name: 'Medium & Medium',
            blurb: 'The most adaptable hair type. A clean, softening routine keeps it healthy and shiny without tipping it oily or dry — the classic all-rounder.',
        },
        'medium-dense': {
            name: 'Medium & Dense',
            blurb: 'A full head of balanced hair. The focus shifts to manageability, shine and protecting the lengths from breakage as your hair grows.',
        },
        'coarse-thin': {
            name: 'Coarse & Thin',
            blurb: 'Thick, dry strands over a sparse density. Your edit pairs scalp-and-growth support with the deeper moisture coarse hair always craves.',
        },
        'coarse-medium': {
            name: 'Coarse & Medium',
            blurb: 'Strong, thirsty strands with a healthy density. Deep moisture and frizz-smoothing do the heavy lifting so your hair stays soft and defined.',
        },
        'coarse-dense': {
            name: 'Coarse & Dense',
            blurb: 'The most moisture-hungry, voluminous type. Rich hydration, anti-frizz smoothing and breakage protection keep all that hair soft, sleek and healthy.',
        },
    };

    /* category metadata + cadence shown on each shelf card */
    const CATEGORIES = {
        shampoo: { step: 1, name: 'Shampoo', cadence: '2–4× a week' },
        conditioner: { step: 2, name: 'Conditioner', cadence: 'Every wash' },
        scalp: {
            step: 3,
            name: 'Scalp Serum & Treatment',
            cadence: '1–3× a week',
        },
        mask: { step: 4, name: 'Weekly Hair Mask', cadence: '1× a week' },
        leavein: {
            step: 5,
            name: 'Leave-In Conditioner',
            cadence: 'Every wash',
        },
        heat: { step: 6, name: 'Heat Protectant', cadence: 'Before any heat' },
        styling: { step: 7, name: 'Styling & Finish', cadence: 'As you style' },
        oil: { step: 8, name: 'Finishing Oil', cadence: 'Ends, as needed' },
        supplement: { step: 9, name: 'Growth Supplement', cadence: 'Daily' },
    };

    /* Foundation pick shown above every routine — applies to all hair types. */
    const FOUNDATION = {
        id: 'jolie-showerhead',
        brand: 'Jolie',
        name: 'Filtered Showerhead',
        price: '≈ $165',
        repurchase: 0,
        refill: 'Filter ≈ every 3 months',
        img: 'Jolie Filtered Showerhead',
        imgUrl: 'https://m.media-amazon.com/images/I/61MCvSZUKaL._SL1500_.jpg',
        shop: 'https://go.shopmy.us/p-67307318',
        tagline: "Start here — it's the water, first.",
        why: 'Every product below works harder when the water itself is clean. Jolie filters out the chlorine, heavy metals and hard-water minerals that dry out hair, dull colour and irritate the scalp — so this is the foundation of any growth routine, no matter your hair type.',
        ingredients:
            'A multi-stage KDF-55 + calcium-sulfite filter that removes chlorine, chloramine and heavy metals from your shower water.',
        howTo: 'Swaps onto your existing shower arm in minutes. Replace the filter roughly every 90 days to keep performance up.',
        avoid: "Hard or heavily chlorinated water undoes good products — don't skip this and wonder why hair still feels dry.",
        // Recurring replacement — for anyone who already owns the head (and every owner, every ~90 days).
        refillProduct: {
            id: 'jolie-filter-refill',
            brand: 'Jolie',
            name: 'Replacement Filter',
            price: '≈ $38',
            repurchase: 13, // ~every 3 months
            refill: 'Replace every 3 months',
            img: 'Jolie Replacement Filter',
            imgUrl: 'https://exclusivebeautyclub.com/cdn/shop/products/jolie-showerhead-replacement-filter-jolie-skin-co-shop-at-exclusive-beauty-club-267805.jpg?v=1762271295',
            shop: 'https://go.shopmy.us/p-67307418',
            tagline: 'Already have the head? Keep it working.',
            why: "A filter only works until it's full. After about 90 days it stops absorbing chlorine and minerals — so swapping it on schedule is what keeps your water (and everything you wash with it) actually clean.",
            ingredients:
                'A fresh multi-stage KDF-55 + calcium-sulfite cartridge — the same filtration, renewed.',
            howTo: 'Twists into your existing Jolie head in under a minute. Set a reminder for every 90 days.',
            avoid: "Don't stretch it past ~3 months — a spent filter quietly does nothing, and your hair feels it first.",
        },
    };

    function pick(t, d, table) {
        return table[t + '-' + d] || table['_'];
    }

    /* Returns ordered [{cat, pro, alt, why}] for a texture/density combo. */
    function buildRoutine(t, d, p, status) {
        const isThin = d === 'thin',
            isDense = d === 'dense';
        const R = [];

        /* ---- 1. Shampoo ---- */
        let shamPro, shamAlt, shamWhy;
        if (isThin) {
            shamPro = 'dav-energizing-sham';
            shamAlt = 'm-actacre-sham';
            shamWhy =
                'Because your hair reads sparse, we lead with a density-supporting cleanse to wake the follicles — moisture comes later in the routine.';
        } else if (t === 'fine') {
            shamPro = 'dav-momo-sham';
            shamAlt = 'm-bb-gentle-sham';
            shamWhy =
                'Fine hair is often told to fear moisture — but the cuticle stays more open and deposits moisture just as fast as it loses it. A moisture-forward cleanse paired with protein to seal it in is what lets fine hair actually retain the length it grows.';
        } else if (t === 'coarse') {
            shamPro = 'dav-momo-sham';
            shamAlt = 'm-briogeo-moist-sham';
            shamWhy =
                'Coarse hair loses moisture fast — a hydrating cleanse stops the dryness and frizz before they start.';
        } else {
            shamPro = 'dav-oi-sham';
            shamAlt = 'm-bb-hio-sham';
            shamWhy =
                'Your balanced hair does best with a softening everyday wash that won’t tip it oily or dry.';
        }
        R.push({ cat: 'shampoo', pro: shamPro, alt: shamAlt, why: shamWhy });

        /* ---- 2. Conditioner ---- */
        let conPro, conAlt, conWhy;
        if (t === 'fine') {
            conPro = 'dav-momo-cond';
            conAlt = 'm-bb-hio-cond';
            conWhy =
                'Fine hair loses moisture almost as fast as it absorbs it — a moisture-forward conditioner floods the strand, and the keratin leave-in seals it in. This combination builds the resilience to grow and keep length.';
        } else if (t === 'coarse') {
            conPro = 'dav-momo-cond';
            conAlt = 'm-briogeo-moist-cond';
            conWhy =
                'Coarse lengths need real slip and softness, so this richer conditioner makes hair workable and frizz-free.';
        } else {
            conPro = 'dav-oi-cond';
            conAlt = 'm-bb-hio-cond';
            conWhy =
                'A featherlight, shine-boosting conditioner that keeps balanced hair soft and easy to comb.';
        }
        R.push({ cat: 'conditioner', pro: conPro, alt: conAlt, why: conWhy });

        /* ---- 3. Scalp serum / treatment ---- */
        let scPro, scAlt, scWhy;
        if (isThin) {
            scPro = 'dav-energizing-superactive';
            scAlt = 'm-ordinary-serum';
            scWhy =
                'This is the hero of a thinning routine — a leave-on tonic that targets the growth phase week after week.';
        } else if (isDense) {
            scPro = 'dav-detox-scrub';
            scAlt = 'm-briogeo-scalp-scrub';
            scWhy =
                'With so much hair, build-up hides at the scalp — a weekly exfoliating treatment keeps the follicles clear and healthy.';
        } else {
            scPro = 'dav-replumping-superactive';
            scAlt = 'm-actacre-serum';
            scWhy =
                'A strengthening leave-on treatment that plumps and supports the strand so your density holds as hair grows.';
        }
        R.push({ cat: 'scalp', pro: scPro, alt: scAlt, why: scWhy });

        /* ---- 4. Mask ---- */
        let mPro, mWhy;
        if (t === 'coarse') {
            mPro = 'dav-momo-mask';
            mWhy =
                'Once a week, wrap coarse hair in the OI Butter Mask for deep, cushioning hydration that keeps it soft, frizz-free and luminous.';
        } else if (t === 'fine') {
            mPro = 'dav-nounou-mask';
            mWhy =
                'Fine hair is chronically under-treated — a weekly nourishing mask deposits the moisture and protein that slip out fast, building the resilience to hold onto length instead of snapping off.';
        } else {
            mPro = 'dav-nounou-mask';
            mWhy =
                'A weekly nourishing mask keeps balanced lengths healthy and protected, especially if you colour or heat-style.';
        }
        R.push({ cat: 'mask', pro: mPro, alt: 'm-briogeo-mask', why: mWhy });

        /* ---- 5. Leave-in conditioner (spray, for slip) ---- */
        let liWhy, liPro, liAlt;
        if (t === 'fine') {
            liPro = 'm-its-a-10-keratin';
            liAlt = 'm-its-a-10-keratin';
            liWhy =
                'This is the most important step for fine hair — keratin physically smooths and seals the raised cuticle so moisture and protein stay locked in. Davines does not make a keratin spray, so this is one slot where the best product wins regardless of brand. Seal this step and everything you layered below actually stays.';
        } else if (t === 'coarse') {
            liPro = 'm-its-a-10-keratin';
            liAlt = 'm-its-a-10';
            liWhy =
                'A moisture-rich leave-in conditioner sprayed on after the shower gives thirsty, coarse lengths real slip for detangling — the groundwork before you heat-protect and style.';
        } else {
            liPro = 'm-its-a-10';
            liAlt = 'm-its-a-10-keratin';
            liWhy =
                'A true leave-in conditioner misted on damp hair detangles and softens, laying down slip and moisture before heat protection and styling.';
        }
        R.push({ cat: 'leavein', pro: liPro, alt: liAlt, why: liWhy });

        /* ---- 6. Heat protectant ---- */
        const heatWhy =
            t === 'fine'
                ? 'Non-negotiable before any hot tool — a light-mist heat protectant shields fine, fragile strands from blow-dryers and irons so you keep the length you grow.'
                : 'Non-negotiable before any hot tool — a heat protectant seals the cuticle against blow-dryers, irons and wands so heat builds shine instead of breakage.';
        R.push({
            cat: 'heat',
            pro: 'dav-melu-shield',
            alt: 'm-amika-blockade',
            why: heatWhy,
        });

        /* ---- 7. Styling & finish ---- */
        let stPro, stAlt, stWhy;
        if (t === 'fine') {
            stPro = 'dav-volume-mousse';
            stAlt = 'm-bb-mousse';
            stWhy =
                'A volume mousse gives fine hair buildable, touchable lift that lasts through the day — more controlled than a spray, dries brushable not stiff, and holds body without going flat.';
        } else if (t === 'coarse') {
            stPro = 'dav-love-smooth';
            stAlt = 'm-colorwow-dreamcoat';
            stWhy =
                'A smoothing primer relaxes frizz and humidity for a sleeker, more polished finish on coarse hair.';
        } else {
            stPro = 'dav-blowdry-primer';
            stAlt = 'm-colorwow-dreamcoat';
            stWhy =
                'A blow-dry primer cuts drying time and leaves balanced hair glossy, smooth and easy to shape.';
        }
        R.push({ cat: 'styling', pro: stPro, alt: stAlt, why: stWhy });

        /* ---- 8. Finishing oil ---- */
        let oilWhy;
        if (t === 'fine') {
            oilWhy =
                'A drop or two on the ends only seals split-prone tips and adds shine — kept low and light so it never drags fine hair down.';
        } else if (t === 'coarse') {
            oilWhy =
                'A finishing oil seals in moisture, smooths frizz and lays a glossy shine over thirsty, coarse ends.';
        } else {
            oilWhy =
                'A few drops of finishing oil smooth frizz, seal the ends and leave a healthy, glassy shine.';
        }
        R.push({
            cat: 'oil',
            pro: 'dav-oi-oil',
            alt: 'm-moroccanoil',
            why: oilWhy,
        });

        /* ---- 9. Growth supplement ---- */
        let supWhy;
        if (isThin) {
            supWhy =
                'When density is your main concern, a daily supplement supports growth from the inside in a way topicals can’t — an easy, affordable habit to commit to.';
        } else if (isDense) {
            supWhy =
                'Optional for you — more of a maintenance and shine boost than a necessity, since density isn’t your challenge.';
        } else {
            supWhy =
                'A steady daily habit that supports stronger, fuller growth over time — the long game of your routine.';
        }
        R.push({
            cat: 'supplement',
            pro: 'mr-hair',
            alt: 'mr-biotin',
            why: supWhy,
        });

        if (p) applyPattern(R, t, d, p);
        if (status && status !== 'natural') applyColor(R, status, p);
        return R;
    }

    /* ---- Colour overlay: blonde & colour-treated swap the daily wash line ---- */
    function applyColor(R, status, p) {
        const get = c => R.find(s => s.cat === c);
        const sham = get('shampoo'),
            cond = get('conditioner');
        const curlish = p === 'curly' || p === 'coily';
        if (status === 'color') {
            if (!curlish) {
                sham.pro = 'dav-minu-sham';
                sham.alt = 'm-pureology-sham';
                cond.pro = 'dav-minu-cond';
                cond.alt = 'm-pureology-cond';
                sham.why =
                    'Colour-treated hair fades and dries with every wash — MINU is a gentle, colour-locking cleanse that protects your tone and adds illuminating shine.';
                cond.why =
                    'A colour-protecting conditioner that seals the cuticle so colour stays vibrant and the lengths stay glossy and moisturised.';
            } else {
                cond.why =
                    cond.why +
                    ' Your curl line is sulfate-light and colour-safe, so it already protects your tone.';
            }
        } else if (status === 'blonde') {
            if (!curlish) {
                sham.pro = 'dav-heart-sham';
                sham.alt = 'm-bb-bond-sham';
                cond.pro = 'dav-heart-cond';
                cond.alt = 'm-bb-bond-cond';
                sham.why =
                    'Blonde hair breaks because bleaching leaves it dry and porous — Heart of Glass floods it with moisture and bond strength with a sheer toning pigment safe to use 2—3× a week. Rotate with your other shampoo so colour keeps its dimension.';
                cond.why =
                    'A rich, strengthening conditioner that deeply moisturises fragile blonde lengths and smooths them for glassy, breakage-free shine.';
                const blondeOil = R.find(s => s.cat === 'oil');
                if (blondeOil) {
                    blondeOil.alt = 'm-moroccanoil-light';
                    blondeOil.why =
                        'The original Moroccanoil has an amber tint that deposits on light hair — always use Treatment Light or Violet Oil for blonde. Light is colourless and safe every wash; Violet adds a toning boost 1—2× a week. Choose based on how much brass you are managing.';
                }
            } else {
                cond.why =
                    cond.why +
                    ' Add a weekly blue or purple gloss to keep your blonde bright and brass-free.';
            }
        }
    }

    /* ---- Pattern overlay: reshapes specific steps by curl pattern ---- */
    function applyPattern(R, t, d, p) {
        const get = c => R.find(s => s.cat === c);
        const sham = get('shampoo'),
            cond = get('conditioner'),
            li = get('leavein'),
            heat = get('heat'),
            mask = get('mask'),
            sty = get('styling'),
            oil = get('oil');
        const isThin = d === 'thin';

        if (p === 'straight') {
            sham.cadence = '2–4× a week';
            if (d === 'dense' && t !== 'coarse') {
                sham.pro = 'dav-rebalancing-sham';
                sham.why =
                    'Straight, dense hair gets oily at the roots fastest — a rebalancing cleanse regulates the scalp so your wash lasts longer, while volume comes from your styling step.';
            }
            li.why =
                'Straight hair shows product weight fastest, so use a light hand — a few mists through the lengths detangle and soften without greasing the roots.';
            return;
        }
        if (p === 'wavy') {
            sham.cadence = '2–3× a week';
            li.why =
                'Mist your leave-in through soaking-wet hair and scrunch upward — it coaxes out your natural S-bend instead of dragging it straight.';
            sty.pro = 'dav-curl-mousse';
            sty.alt = 'm-curl-cream';
            sty.why =
                'A weightless mousse or curl cream scrunched into wet hair brings out soft, defined waves and fights the frizz waves are prone to.';
            oil.why =
                'A single drop of oil scrunched into the ends fights frizz and adds shine without flattening your wave.';
            return;
        }
        if (p === 'curly') {
            sham.cadence = '1–2× a week';
            if (isThin) {
                sham.why =
                    'Density comes first, so keep the energizing cleanse — but only lather the scalp and let it rinse through your curls; never scrub the lengths.';
            } else {
                sham.pro = 'dav-love-curl-sham';
                sham.alt = 'm-briogeo-curl-sham';
                sham.why =
                    'Curls dry out fast, so we swap in a gentle, hydrating curl cleanse — your scalp-and-growth support moves to the leave-on serum step below.';
            }
            cond.pro = 'dav-love-curl-cond';
            cond.alt = 'm-briogeo-curl-cond';
            cond.why =
                'A slip-rich curl conditioner detangles and defines without roughing the cuticle — finger-detangle in the shower while it’s still in.';
            if (t === 'fine') {
                li.why =
                    'Fine curly hair loses protein fastest of all — the keratin spray seals the raised cuticle so the moisture you just put in actually stays. Apply to soaking-wet curls before you scrunch and define.';
            } else {
                li.pro = 'm-its-a-10-keratin';
                li.alt = 'm-leavein-curl';
                li.why =
                    'A true leave-in conditioner worked through soaking-wet curls gives the slip to finger-detangle and locks in the moisture curls need before you style — never skip it.';
            }
            heat.why =
                'Only if you diffuse or blow-dry — protect first. Air-drying your curls skips this step entirely.';
            mask.pro = 'dav-momo-mask';
            mask.why =
                'Curls thrive on the OI Butter Mask — its roucou-oil richness floods each strand weekly so they stay soft, defined and frizz-free instead of dry and crunchy.';
            sty.pro = 'dav-curl-serum';
            sty.alt = 'm-curl-cream';
            sty.why =
                'Build and hold definition with a curl serum or cream raked through soaking-wet hair, then diffuse on low or air-dry — don’t touch until fully dry.';
            oil.why =
                'Seal your styled curls with a little oil for lasting moisture and glassy shine — the “O” of the LOC method.';
            return;
        }
        if (p === 'coily') {
            sham.cadence = '1× a week or less';
            if (isThin) {
                sham.why =
                    'Keep the energizing cleanse for density, but use it sparingly — wash once a week at most and never scrub your coils.';
            } else {
                sham.pro = 'dav-love-curl-sham';
                sham.alt = 'm-briogeo-curl-sham';
                sham.why =
                    'Coils are fragile and dry, so cleanse gently and rarely — your scalp-and-growth support shifts to the leave-on serum step below.';
            }
            cond.pro = 'dav-momo-cond';
            cond.alt = 'm-briogeo-curl-cond';
            cond.why =
                'Coily hair needs the richest conditioner with maximum slip — leave some in to keep coils soft and possible to detangle.';
            if (t === 'fine') {
                li.why =
                    'Fine coily hair has the most open cuticle of all — keratin is non-negotiable here. It seals in the moisture below it and gives the protein boost fine coils need to stop snapping at every manipulation.';
            } else {
                li.pro = 'm-its-a-10-keratin';
                li.alt = 'm-leavein-curl';
                li.why =
                    'Drench soaking-wet coils in a rich leave-in conditioner for maximum slip and moisture — the “L” of the LOC method, and non-negotiable for coils.';
            }
            heat.why =
                'Coils do best air-dried or diffused on low — if you ever reach for heat, this protectant is essential first.';
            mask.pro = 'dav-nounou-mask';
            mask.why =
                'A rich, reconstructing mask every week keeps fragile coils strong and deeply moisturised against breakage.';
            sty.pro = 'dav-curl-mousse';
            sty.alt = 'm-curl-cream';
            sty.why =
                'Define and clump coils with a moisturising curl cream or mousse on soaking-wet hair, then seal with oil and diffuse or air-dry.';
            oil.why =
                'Seal everything in with an oil — the “O” of LOC — for lasting moisture, sheen and protection against breakage.';
            return;
        }
    }

    /* ---- Layering guide (wash-day vs daily), lightly tailored ---- */
    function buildLayering(t, d, p) {
        const curlish = p === 'curly' || p === 'coily';
        const wavish = p === 'wavy' || curlish;
        const heatText = curlish
            ? 'If you diffuse or blow-dry, mist a heat protectant first. Air-drying? You can skip it.'
            : 'Before any blow-dryer, iron or wand, coat damp hair in heat protectant — every single time.';
        const styleText = curlish
            ? 'Rake a curl serum or cream through soaking-wet hair and scrunch upward, then diffuse on low or air-dry — don’t touch until fully dry.'
            : p === 'wavy'
              ? 'Scrunch a curl mousse or cream into wet hair from the ends up, then diffuse or air-dry to bring out the wave.'
              : t === 'coarse'
                ? 'Work a smoothing primer through, then blow-dry for a sleek, frizz-free finish.'
                : t === 'fine'
                  ? 'Mist a volumizer at the roots, then blow-dry flipped upside down for body.'
                  : 'Spray a blow-dry primer, then style as usual.';
        const oilText = curlish
            ? 'Seal your styled curls with a few drops of oil down the lengths — the final “O” of the LOC method — for moisture and shine.'
            : t === 'fine'
              ? 'One drop of oil on the very ends only — just enough to seal split ends and add shine without weighing hair down.'
              : 'Smooth a few drops of oil over the ends to seal, fight frizz and finish with a glassy shine.';
        const wash = [
            {
                n: 1,
                name: 'Filter the water',
                text: 'It starts before the products: a filtered showerhead strips out the chlorine and hard minerals that dry hair out — the foundation every step below builds on.',
            },
            {
                n: 2,
                name: 'Cleanse',
                text:
                    (curlish
                        ? 'Focus shampoo on the scalp only and let it rinse through the lengths — wash less often to protect moisture. '
                        : 'Shampoo at the scalp, massaging 60 seconds to boost circulation. ') +
                    (t === 'coarse' || curlish
                        ? 'One gentle lather is plenty.'
                        : 'Repeat only if needed.'),
            },
            {
                n: 3,
                name: 'Condition',
                text: curlish
                    ? 'A slip-rich conditioner on the lengths — finger-detangle while it’s in, and leave a little in for extra moisture.'
                    : t === 'fine'
                      ? 'Conditioner on mid-lengths to ends only — never the roots.'
                      : 'Work conditioner through the lengths, comb, leave 2 minutes, rinse.',
            },
            {
                n: 4,
                name: 'Treat the scalp',
                text:
                    d === 'thin'
                        ? 'On towel-dried hair, massage in your scalp tonic and leave it on. This is your non-negotiable step.'
                        : 'Apply your scalp serum or weekly treatment and leave on.',
            },
            {
                n: 5,
                name: 'Mask (weekly)',
                text: 'Once a week, swap conditioner for your mask — leave 5–10 minutes before rinsing.',
            },
            {
                n: 6,
                name: 'Leave-in conditioner',
                text: curlish
                    ? 'Mist a spray leave-in through soaking-wet hair to detangle and lock in moisture before you style.'
                    : t === 'fine'
                      ? 'A few mists of leave-in through damp lengths — light hands keep roots lifted.'
                      : 'Mist a spray leave-in through damp hair to detangle and soften before styling.',
            },
            { n: 7, name: 'Heat protect', text: heatText },
            { n: 8, name: 'Style', text: styleText },
            { n: 9, name: 'Seal with oil', text: oilText },
        ];
        const daily = [
            {
                n: 1,
                name: 'Supplement',
                text: 'Take your growth supplement with breakfast — consistency is what delivers results.',
            },
            {
                n: 2,
                name: 'Scalp check',
                text:
                    d === 'thin'
                        ? 'On non-wash days, a few drops of the more affordable peptide serum keeps the scalp active daily.'
                        : 'Refresh roots with dry shampoo or a light mist as needed; keep the scalp clean and calm.',
            },
            {
                n: 3,
                name: wavish ? 'Refresh your pattern' : 'Refresh & protect',
                text: wavish
                    ? 'Re-wet curls with a water + leave-in spray and scrunch to revive definition — never brush dry curls; re-wet to restyle.'
                    : 'A touch of leave-in on the ends tames frizz; a drop of oil seals and shines between washes.',
            },
            {
                n: 4,
                name: 'Repurchase on time',
                text: 'Re-buy each product before it runs out so you never break the routine — your saved list tracks the timing.',
            },
        ];
        return { wash, daily };
    }

    /* ============================================================
   GROWTH RATIONALE — the "why this grows your hair" closing
   section. Tailored by texture / density / pattern / status.
   ============================================================ */
    function buildRationale(t, d, p, status) {
        const isThin = d === 'thin',
            isDense = d === 'dense';
        const curlish = p === 'curly' || p === 'coily';
        const Tl = TEXTURES[t].label.toLowerCase(),
            Dl = DENSITIES[d].label.toLowerCase(),
            Pl = PATTERNS[p].label.toLowerCase();

        /* The core insight: growth happens at the scalp; LENGTH happens by
     not losing what you grow. Every profile gets a tailored version. */
        let principle;
        if (isThin) {
            principle = `Your hair grows about half an inch a month no matter what — so the real question for ${Tl}, ${Dl}-density hair isn’t whether it grows, it’s whether it survives long enough to show. We lead with the scalp, because thinning density means every follicle counts: the energizing tonic and growth support wake up the root, while the moisture and protection downstream make sure the new length you earn doesn’t snap off before you ever see it.`;
        } else if (curlish) {
            principle = `Length on ${Pl} hair is won or lost on moisture. Because the natural oils from your scalp can’t travel down a ${p === 'coily' ? 'tight coil' : 'spiral'}, your lengths are dry by default — and dry hair is brittle hair that breaks faster than it grows. This whole routine is engineered to keep your ${Pl} hair soft, sealed and hydrated from wash to style, so it stretches to its full length instead of snapping back.`;
        } else if (t === 'fine') {
            principle = `Fine hair has the most delicate strand of any type, which means it breaks the easiest — and breakage, not slow growth, is almost always why fine hair won’t pass a certain length. So instead of drying volumizers, your routine is built on lightweight moisture and gentle strengthening: enough body to look full, but enough flexibility and hydration that each fragile strand bends instead of snapping.`;
        } else if (t === 'coarse') {
            principle = `Coarse hair is strong but thirsty — its raised cuticle loses moisture fast, and once it dries out it gets brittle and frizzy and starts to split. For ${Dl}-density, coarse hair, length comes from keeping all that strength supple: deep, consistent moisture so the strand stays elastic and holds onto every inch you grow.`;
        } else {
            principle = `Balanced, ${Tl} hair is the most adaptable type — which means the fastest route to length is simply not getting in its own way. Your routine keeps the scalp healthy, the lengths moisturised and every hot tool buffered, so nothing interrupts the steady growth your hair is already capable of.`;
        }

        /* Four pillars — the strategy, mapped to the actual product roles. */
        const pillars = [];

        // 1 — scalp / follicle
        pillars.push({
            title: 'It starts at the scalp',
            text: isThin
                ? 'Healthy hair is grown, not bought — so your routine front-loads the follicle. The cleanse stimulates circulation and the leave-on tonic supports the active growth phase, giving thinning density its best shot at fuller regrowth.'
                : isDense
                  ? 'With a lot of hair, build-up smothers the follicle without you noticing. Weekly exfoliation keeps the scalp clear and the roots breathing, so growth is never quietly choked off at the source.'
                  : 'A clean, balanced scalp is the soil your hair grows from. The cleanse and weekly treatment keep the follicle clear and supported, so each strand starts strong.',
        });

        // 2 — moisture / breakage (the length pillar)
        pillars.push({
            title: curlish
                ? 'Moisture is length insurance'
                : t === 'fine'
                  ? 'Strength without dryness'
                  : 'Moisture keeps it on your head',
            text: curlish
                ? `Every hydrating step — the gentle cleanse, the rich conditioner, the weekly mask and the sealing oil — exists to stop the dry-then-snap cycle that keeps ${Pl} hair stuck at one length. Moisturised hair is elastic hair, and elastic hair holds its length.`
                : t === 'fine'
                  ? 'Swapping volume for lightweight moisture is the single biggest change for fine hair. DEDE and a strengthening mask keep delicate strands hydrated and flexible — so they survive brushing, styling and daily wear instead of breaking mid-length.'
                  : 'The conditioner, weekly mask and finishing oil work as a moisture system. Well-moisturised hair flexes instead of fracturing, which is exactly how coarse and medium hair gets past the length where it usually starts to split.',
        });

        // 3 — protection
        pillars.push({
            title: 'Protected from the things that break it',
            text:
                status === 'blonde'
                    ? 'Lightened hair is porous and fragile, so your routine doubles down on defence: Heart of Glass rebuilds bonds and floods in moisture, the leave-in and heat protectant guard every style, and the finishing oil seals the cuticle — because for blonde hair, preventing breakage IS the growth strategy.'
                    : status === 'color'
                      ? 'Colour-treated hair is chemically stressed, so MINU protects your tone while the leave-in, heat protectant and finishing oil shield the strand from the heat and friction that turn processed hair brittle.'
                      : 'A dedicated leave-in, heat protectant and finishing oil mean your hair is buffered at every vulnerable moment — wet detangling, hot tools, daily friction. Less damage means less breakage, and less breakage means more length.',
        });

        // 4 — consistency / inside-out
        pillars.push({
            title: 'Supported inside and out',
            text: 'A daily supplement feeds growth from within while the topical routine protects from without — and because the whole system is built to repeat, your saved list keeps you on schedule. Hair rewards consistency over months, not days; this routine is built to be the one you actually keep.',
        });

        const close = isThin
            ? 'Give it three to six months of consistency. Density rebuilds slowly, but this is the routine that compounds — and the saved list is here so you never break the streak.'
            : curlish
              ? 'Stay consistent and protect the moisture, and your curls will start holding length you didn’t know they had. Re-buy before you run out — the saved list tracks it for you.'
              : 'Length is a long game won by not losing ground. Keep this routine steady for a few months and let your saved list keep you on track.';

        return { principle, pillars, close };
    }

    /* ============================================================
   THE GROWTH EDIT — app: finder, shelf, layering, saved list
   ============================================================ */
    (function () {
        const LS_TYPE = 'tgi_type',
            LS_LIST = 'tgi_list';
        /* Your ShopMy storefront — used as the default link on every Shop button.
     To link a specific product, add  shop:'https://shopmy.us/...'  to that
     product in guide-data.js and it overrides this. */
        const STOREFRONT = 'https://shopmy.us/shop/lifewithlaurenj';
        const shopUrl = p => (p && p.shop ? p.shop : STOREFRONT);
        const $ = (s, el = document) => el.querySelector(s);
        const esc = s =>
            String(s).replace(
                /[&<>"]/g,
                c =>
                    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[
                        c
                    ],
            );

        let state = {
            texture: null,
            density: null,
            pattern: null,
            status: null,
        };
        let clickedGroups = new Set(); // which finder rows the user has actively touched
        let generated = false; // has the user generated their edit yet?
        let saved = load(LS_LIST, []); // array of product ids

        function load(k, f) {
            try {
                const v = JSON.parse(localStorage.getItem(k));
                return v ?? f;
            } catch (e) {
                return f;
            }
        }
        function save(k, v) {
            try {
                localStorage.setItem(k, JSON.stringify(v));
            } catch (e) {}
        }

        /* ---------- FINDER ---------- */
        function buildFinder() {
            const tg = $('#texture-grid'),
                dg = $('#density-grid'),
                pg = $('#pattern-grid'),
                sg = $('#status-grid');
            tg.innerHTML = Object.entries(TEXTURES)
                .map(([k, v]) => chip('t', k, v.label, v.desc))
                .join('');
            dg.innerHTML = Object.entries(DENSITIES)
                .map(([k, v]) => chip('d', k, v.label, v.desc))
                .join('');
            pg.innerHTML = Object.entries(PATTERNS)
                .map(([k, v]) => chip('p', k, v.label, v.desc))
                .join('');
            if (sg)
                sg.innerHTML = Object.entries(HAIRSTATUS)
                    .map(([k, v]) => chip('s', k, v.label, v.desc))
                    .join('');
            tg.addEventListener('click', e => onChip(e, 'texture'));
            dg.addEventListener('click', e => onChip(e, 'density'));
            pg.addEventListener('click', e => onChip(e, 'pattern'));
            if (sg) sg.addEventListener('click', e => onChip(e, 'status'));
        }
        function chip(g, k, name, desc) {
            return `<button class="chip" data-g="${g}" data-k="${k}">
      <span class="chip-tick">✓</span>
      <span class="chip-name serif">${esc(name)}</span>
      <span class="chip-desc">${esc(desc)}</span>
    </button>`;
        }
        function onChip(e, key) {
            const b = e.target.closest('.chip');
            if (!b) return;
            state[key] = b.dataset.k;
            clickedGroups.add(key);
            markActive();
            save(LS_TYPE, state);
            updateGenerate();
            if (generated) renderResult(); // live-update once they've already generated
        }
        function markActive() {
            document
                .querySelectorAll('#texture-grid .chip')
                .forEach(c =>
                    c.classList.toggle('active', c.dataset.k === state.texture),
                );
            document
                .querySelectorAll('#density-grid .chip')
                .forEach(c =>
                    c.classList.toggle('active', c.dataset.k === state.density),
                );
            document
                .querySelectorAll('#pattern-grid .chip')
                .forEach(c =>
                    c.classList.toggle('active', c.dataset.k === state.pattern),
                );
            document
                .querySelectorAll('#status-grid .chip')
                .forEach(c =>
                    c.classList.toggle('active', c.dataset.k === state.status),
                );
        }

        /* enable the Generate button once the core three are chosen */
        function readyToGenerate() {
            return !!(state.texture && state.density && state.pattern);
        }
        function updateGenerate() {
            const btn = $('#generate-btn'),
                hint = $('#generate-hint');
            if (!btn) return;
            const ready = readyToGenerate();
            btn.disabled = !ready;
            btn.classList.toggle('ready', ready);
            const lbl = $('.generate-label', btn);
            if (lbl)
                lbl.textContent = generated
                    ? 'Regenerate my edit'
                    : 'Generate my edit';
            if (hint) {
                hint.textContent = ready
                    ? state.status
                        ? 'Looks complete — generate your personalised routine.'
                        : 'Add your colour status for a blonde/colour-tuned edit, or generate now.'
                    : 'Choose your texture, density & pattern above to unlock your routine.';
            }
        }

        /* the satisfying “generating…” moment, then reveal + scroll */
        const GEN_MSGS = [
            'Reading your hair profile…',
            'Matching Davines lines…',
            'Building your 9-step routine…',
            'Finishing your edit…',
        ];
        let genTimer;
        function runGenerate() {
            if (!readyToGenerate()) return;
            const btn = $('#generate-btn'),
                res = $('#result');
            btn.classList.add('is-generating');
            const lbl = $('.generate-label', btn);
            if (lbl) lbl.textContent = 'Generating';
            res.innerHTML = `<div class="result-loading">
      <div class="loader-ring"></div>
      <div class="loader-text serif">Crafting your personalised edit…</div>
      <div class="loader-sub" id="loader-sub">${GEN_MSGS[0]}</div>
    </div>`;
            requestAnimationFrame(() => {
                const y = res.getBoundingClientRect().top + window.scrollY - 70;
                window.scrollTo({ top: y, behavior: 'smooth' });
            });
            let i = 0;
            const sub = $('#loader-sub');
            clearInterval(genTimer);
            genTimer = setInterval(() => {
                i++;
                if (sub && GEN_MSGS[i]) sub.textContent = GEN_MSGS[i];
            }, 360);
            setTimeout(() => {
                clearInterval(genTimer);
                generated = true;
                renderResult();
                btn.classList.remove('is-generating');
                updateGenerate();
            }, 1500);
        }

        /* ---------- RESULT + SHELF ---------- */
        function renderResult() {
            const res = $('#result');
            if (
                !generated ||
                !(state.texture && state.density && state.pattern)
            ) {
                res.innerHTML = `<div class="result-empty">Your personalised edit will appear here — make your selections above and hit <em>Generate my edit</em>.</div>`;
                return;
            }
            const key = state.texture + '-' + state.density;
            const meta = PROFILE_COPY[key];
            const pat = PATTERNS[state.pattern],
                patCopy = PATTERN_COPY[state.pattern];
            const status = state.status || 'natural';
            const name = meta.name + ' · ' + pat.label;
            const blurb =
                meta.blurb + ' ' + patCopy.clause + (STATUS_COPY[status] || '');
            const traits = [
                TEXTURES[state.texture].label + ' texture',
                DENSITIES[state.density].label + ' density',
                pat.label + ' pattern',
                patCopy.priority,
            ];
            if (status !== 'natural')
                traits.splice(3, 0, HAIRSTATUS[status].label);
            const routine = buildRoutine(
                state.texture,
                state.density,
                state.pattern,
                status,
            );
            const layer = buildLayering(
                state.texture,
                state.density,
                state.pattern,
            );
            const rationale = buildRationale(
                state.texture,
                state.density,
                state.pattern,
                status,
            );

            res.innerHTML = `
      <div class="result-banner reveal">
        <span class="eyebrow light">Your hair profile</span>
        <div class="result-name">${esc(name)}</div>
        <p class="result-blurb">${esc(blurb)}</p>
        <div class="result-traits">${traits.map(t => `<span class="trait">${esc(t)}</span>`).join('')}</div>
      </div>

      ${foundationCard()}

      <div class="shelf">${routine.map(slotCard).join('')}</div>

      <div class="layer-block">
        <div class="sec-head" style="margin-top:clamp(56px,7vw,88px)">
          <span class="eyebrow">The method</span>
          <h2 class="serif">How to layer it</h2>
          <p>Order matters as much as the products. Here’s exactly when each step belongs.</p>
        </div>
        <div class="layer-cols">
          <div class="layer-card reveal">
            <span class="eyebrow">Wash day</span>
            <h3 class="serif">In the shower, in order</h3>
            ${layer.wash.map(s => layerStep(s)).join('')}
          </div>
          <div class="layer-card reveal">
            <span class="eyebrow">Between washes</span>
            <h3 class="serif">Daily upkeep</h3>
            ${layer.daily.map(s => layerStep(s)).join('')}
          </div>
        </div>
      </div>

      <div class="rationale reveal">
        <div class="rationale-head">
          <span class="eyebrow light">Why this grows your hair</span>
          <h2 class="serif">The strategy behind your ${esc(name)} edit</h2>
          <p class="rationale-principle">${esc(rationale.principle)}</p>
        </div>
        <div class="rationale-pillars">
          ${rationale.pillars
              .map(
                  (p, i) => `
            <div class="pillar">
              <span class="pillar-num serif">0${i + 1}</span>
              <div class="pillar-title">${esc(p.title)}</div>
              <p class="pillar-text">${esc(p.text)}</p>
            </div>`,
              )
              .join('')}
        </div>
        <p class="rationale-close quote">${esc(rationale.close)}</p>
      </div>`;
            syncSaveButtons();
            observeReveals(res);
        }

        function layerStep(s) {
            return `<div class="layer-step"><span class="layer-num serif">${s.n}</span>
      <div><div class="layer-step-name">${esc(s.name)}</div>
      <div class="layer-step-text">${esc(s.text)}</div></div></div>`;
        }

        function foundationOption(p, badge, recurring) {
            return `<div class="foundation-opt">
      <span class="pick-tier ${recurring ? 'alt' : 'pro'}">${esc(badge)}</span>
      ${p.imgUrl ? '<img class="foundation-opt-img" style="object-fit:cover;border-radius:12px" src="' + esc(p.imgUrl) + '" alt="' + esc(p.name) + '" loading="lazy">' : '<div class="foundation-opt-img" style="background:repeating-linear-gradient(135deg,var(--cream-deep) 0 9px,var(--paper) 9px 18px);border-radius:12px;display:flex;align-items:flex-end;justify-content:center;padding:12px"><span style="font-family:\'Inter\',sans-serif;font-size:0.58rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:var(--mute)">' + esc(p.img) + '</span></div>'}
      <div class="pick-brand">${esc(p.brand)}</div>
      <div class="foundation-opt-name serif">${esc(p.name)}</div>
      <div class="pick-price">${esc(p.price)}<span class="pick-repurchase">↻ ${esc(p.refill)}</span></div>
      <p class="foundation-opt-why">${esc(p.why)}</p>
      <details class="pick-more">
        <summary>Why it works <span class="ic">+</span></summary>
        <div class="detail">
          <div class="detail-row"><div class="detail-label">${recurring ? 'What you get' : 'How it filters'}</div><div class="detail-text">${esc(p.ingredients)}</div></div>
          <div class="detail-row"><div class="detail-label">How to use</div><div class="detail-text">${esc(p.howTo)}</div></div>
          <div class="detail-row avoid"><div class="detail-label">What to avoid</div><div class="detail-text">${esc(p.avoid)}</div></div>
        </div>
      </details>
      <div class="pick-actions">
        <a class="shop-btn ${recurring ? 'alt' : ''}" href="${esc(shopUrl(p))}" target="_blank" rel="noopener">Shop ↗</a>
        <button class="save-btn" data-save="${esc(p.id)}" aria-label="Save to list">＋</button>
      </div>
    </div>`;
        }

        function foundationCard() {
            const f = FOUNDATION,
                r = f.refillProduct;
            return `<div class="foundation reveal" id="cat-foundation">
      <div class="foundation-badge">Foundation · Step 0</div>
      <div class="foundation-intro">
        <div class="pick-brand">${esc(f.brand)}</div>
        <div class="foundation-name serif">It starts with your water</div>
        <div class="foundation-tag quote">“${esc(f.tagline)}”</div>
        <p class="foundation-why">${esc(f.why)}</p>
      </div>
      <div class="foundation-options">
        ${foundationOption(f, 'New to Jolie · One-time', false)}
        ${foundationOption(r, 'Already have it? · Every 3 mo', true)}
      </div>
    </div>`;
        }

        function slotCard(slot) {
            const c = CATEGORIES[slot.cat];
            const disclaimer =
                slot.cat === 'supplement'
                    ? `
      <div class="disclaimer">
        <div class="disclaimer-icon">!</div>
        <div>
          <div class="disclaimer-title">Please read · This is not medical advice</div>
          <p>Supplements are not medicine, and nothing in this guide is medical advice. <strong>Always talk to your doctor or a qualified healthcare provider before taking any supplement</strong> — especially if you’re pregnant, nursing, taking medication, or managing a health condition. The Hair Insider is not a medical professional, takes no responsibility for any health outcome, and accepts no liability for products you choose to take. You do so entirely at your own discretion and risk.</p>
        </div>
      </div>`
                    : '';
            return `<div class="cat reveal" id="cat-${esc(slot.cat)}">
      <div class="cat-head">
        <span class="cat-step serif">${c.step}</span>
        <div class="cat-titles">
          <div class="cat-name serif">${esc(c.name)}</div>
          <div class="cat-why">${esc(slot.why)}</div>
        </div>
        <div class="cat-cadence">Use<span>${esc(slot.cadence || c.cadence)}</span></div>
      </div>
      ${disclaimer}
      <div class="picks">
        ${pickCard(slot.pro, 'pro')}
        ${pickCard(slot.alt, 'alt')}
      </div>
    </div>`;
        }

        function pickCard(id, tier) {
            const p = PRODUCTS[id];
            if (!p) return '';
            const tierLabel =
                tier === 'pro' ? 'The Pro Pick' : 'The Smart Match';
            return `<div class="pick">
      <span class="pick-tier ${tier}">${tierLabel}</span>
      ${p.imgUrl ? '<img class="pick-img-slot" style="object-fit:cover;border-radius:12px" src="' + esc(p.imgUrl) + '" alt="' + esc(p.name) + '" loading="lazy">' : '<div class="pick-img-slot" style="background:repeating-linear-gradient(135deg,var(--cream-deep) 0 9px,var(--paper) 9px 18px);border-radius:12px;aspect-ratio:4/5;display:flex;align-items:flex-end;justify-content:center;padding:12px"><span style="font-family:\'Inter\',sans-serif;font-size:0.58rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:var(--mute)">' + esc(p.img) + '</span></div>'}
      <div class="pick-brand">${esc(p.brand)}</div>
      <div class="pick-name serif">${esc(p.name)}</div>
      <div class="pick-price">${esc(p.price)}<span class="pick-repurchase">↻ ~${p.repurchase} wks</span></div>
      <p class="pick-why">${esc(p.why)}</p>
      <details class="pick-more">
        <summary>Why it works <span class="ic">+</span></summary>
        <div class="detail">
          <div class="detail-row"><div class="detail-label">Key ingredients</div><div class="detail-text">${esc(p.ingredients)}</div></div>
          <div class="detail-row"><div class="detail-label">How to use</div><div class="detail-text">${esc(p.howTo)}</div></div>
          <div class="detail-row avoid"><div class="detail-label">What to avoid</div><div class="detail-text">${esc(p.avoid)}</div></div>
        </div>
      </details>
      <div class="pick-actions">
        <a class="shop-btn ${tier === 'alt' ? 'alt' : ''}" href="${esc(shopUrl(p))}" target="_blank" rel="noopener">Shop ↗</a>
        <button class="save-btn" data-save="${esc(id)}" aria-label="Save to list">＋</button>
      </div>
    </div>`;
        }

        /* ---------- SAVED LIST ---------- */
        function toggleSave(id) {
            const i = saved.indexOf(id);
            if (i >= 0) {
                saved.splice(i, 1);
            } else {
                saved.push(id);
                toast('Added to your list');
            }
            save(LS_LIST, saved);
            syncSaveButtons();
            renderDrawer();
            updateCount();
        }
        function syncSaveButtons() {
            document.querySelectorAll('[data-save]').forEach(b => {
                const on = saved.includes(b.dataset.save);
                b.classList.toggle('saved', on);
                b.textContent = on ? '✓' : '＋';
            });
        }
        function updateCount() {
            const el = $('#list-count');
            el.textContent = saved.length;
            el.style.display = saved.length ? 'inline-flex' : 'none';
        }
        function renderDrawer() {
            const body = $('#drawer-body');
            if (!saved.length) {
                body.innerHTML = `<div class="drawer-empty"><span class="serif">Your list is empty</span>
        Tap ＋ on any product to build your shopping list and routine.</div>`;
                return;
            }
            body.innerHTML = saved
                .map(id => {
                    const p = PRODUCTS[id];
                    if (!p) return '';
                    return `<div class="li">
        <div class="li-img">${p.imgUrl ? '<img src="' + esc(p.imgUrl) + '" alt="' + esc(p.name) + '" loading="lazy">' : ''}</div>
        <div class="li-main">
          <div class="li-brand">${esc(p.brand)}</div>
          <div class="li-name serif">${esc(p.name)}</div>
          <div class="li-meta">${esc(p.price)} <span class="li-cadence">${p.repurchase ? '↻ repurchase ~' + p.repurchase + ' wks' : '↻ ' + esc(p.refill || 'one-time')}</span></div>
          <div class="li-links">
            <a class="li-shop" href="${esc(shopUrl(p))}" target="_blank" rel="noopener">Shop ↗</a>
            <button class="li-remove" data-save="${esc(id)}">Remove</button>
          </div>
        </div>
      </div>`;
                })
                .join('');
        }

        /* ---------- DRAWER OPEN/CLOSE ---------- */
        function openDrawer() {
            $('#drawer').classList.add('open');
            $('#scrim').classList.add('open');
        }
        function closeDrawer() {
            $('#drawer').classList.remove('open');
            $('#scrim').classList.remove('open');
        }

        /* ---------- TOAST ---------- */
        let toastT;
        function toast(msg) {
            const t = $('#toast');
            t.querySelector('span').textContent = msg;
            t.classList.add('show');
            clearTimeout(toastT);
            toastT = setTimeout(() => t.classList.remove('show'), 1900);
        }

        /* ---------- REVEAL ON SCROLL ---------- */
        let io;
        function observeReveals(root = document) {
            if (!('IntersectionObserver' in window)) {
                root.querySelectorAll('.reveal').forEach(e =>
                    e.classList.add('in'),
                );
                return;
            }
            if (!io) {
                io = new IntersectionObserver(
                    ents => {
                        ents.forEach(e => {
                            if (e.isIntersecting) {
                                e.target.classList.add('in');
                                io.unobserve(e.target);
                            }
                        });
                    },
                    { threshold: 0.12 },
                );
            }
            root.querySelectorAll('.reveal:not(.in)').forEach(e =>
                io.observe(e),
            );
        }

        /* ---------- GLOBAL CLICKS ---------- */
        const SS_SCROLL_TARGET = 'tgi_scroll_target';

        document.addEventListener('click', e => {
            const sv = e.target.closest('[data-save]');
            if (sv) {
                e.preventDefault();
                toggleSave(sv.dataset.save);
                return;
            }

            const shopLink = e.target.closest('.shop-btn, .li-shop');
            if (shopLink) {
                const section = shopLink.closest('[id^="cat-"]');
                if (section) {
                    try {
                        sessionStorage.setItem(SS_SCROLL_TARGET, section.id);
                    } catch (err) {}
                }
            }
        });

        function restoreScrollPosition() {
            let targetId;
            try {
                targetId = sessionStorage.getItem(SS_SCROLL_TARGET);
            } catch (err) {
                return;
            }
            if (!targetId) return;
            const el = document.getElementById(targetId);
            if (el) {
                el.scrollIntoView({ block: 'start' });
            }
            try {
                sessionStorage.removeItem(SS_SCROLL_TARGET);
            } catch (err) {}
        }

        /* ---------- INIT ---------- */
        function init() {
            if (typeof FOUNDATION !== 'undefined') {
                PRODUCTS[FOUNDATION.id] = FOUNDATION;
                if (FOUNDATION.refillProduct)
                    PRODUCTS[FOUNDATION.refillProduct.id] =
                        FOUNDATION.refillProduct;
            } // make Jolie head + filter saveable
            buildFinder();
            const stored = load(LS_TYPE, null);
            if (stored && stored.texture && stored.density && stored.pattern) {
                state = { status: null, ...stored };
                generated = true;
                markActive();
            }
            updateGenerate();
            renderResult();
            renderDrawer();
            updateCount();
            observeReveals(document);
            setTimeout(restoreScrollPosition, 60);

            const gb = $('#generate-btn');
            if (gb) gb.addEventListener('click', runGenerate);
            $('#list-btn').addEventListener('click', () => {
                renderDrawer();
                openDrawer();
            });
            $('#drawer-close').addEventListener('click', closeDrawer);
            $('#scrim').addEventListener('click', closeDrawer);
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape') closeDrawer();
            });
        }
        if (document.readyState === 'loading')
            document.addEventListener('DOMContentLoaded', init);
        else init();
    })();

    return () => {};
}
