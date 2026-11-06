import { founderTransformation } from "../data/founderTransformation";
import { FounderTransformation } from "./FounderTransformation";

// Optional, collapsed-by-default story area. Kept separate from the purchase card.
export function FounderStory() {
    if (!founderTransformation) return null;
    return (
        <details
            className="group mt-10 border-t border-foreground/15 pt-6"
            data-testid="founder-story"
        >
            <summary
                className="flex cursor-pointer list-none items-center justify-between text-[0.7rem] font-medium uppercase tracking-widest text-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground/50"
                data-testid="button-toggle-founder-story"
            >
                <span>The story behind The Growth Edit</span>
                <span
                    aria-hidden="true"
                    className="text-base leading-none transition-transform group-open:rotate-45"
                >
                    +
                </span>
            </summary>
            <div
                className="mt-6 max-w-2xl space-y-4 text-sm leading-relaxed text-foreground/85"
                data-testid="founder-story-copy"
            >
                <p>
                    My entire life, I wanted long hair. But it felt like it
                    would literally never grow. My grandmother was a
                    hairstylist, and even she was like, “Ugh, she’s going to
                    have bad hair for life.” And honestly, for a long time, I
                    kind of did.
                </p>
                <p>
                    Then I got obsessed with hair growth. I went to cosmetology
                    school—and fried it all off. I have dense, fine hair, and I
                    could never figure out how to get it past the middle of my
                    back. It would get to a point, break off, and I’d be right
                    back where I started.
                </p>
                <p>
                    I was so obsessed with getting it long that I had my husband
                    measuring my hair on my back. My mom was measuring it too.
                    At one point, my husband actually said, “I don’t think your
                    hair grows.”
                </p>
                <p>
                    What I finally figured out was that it wasn’t just about
                    shampoo and conditioner. It was how I actually used my
                    products, what order I used them in, and learning to read
                    the signals my hair was giving me.
                </p>
                <p>
                    It took years of trial and error to get to the long brown
                    hair you see here. Now my family says I have the best hair
                    in the family, and people are always telling me it looks
                    like I have extensions. Which is kind of funny, considering
                    where I started.
                </p>
                <p>
                    That’s why I made The Growth Edit. Not to give you another
                    random product to buy, but to help you understand how to put
                    your routine together—and what to pay attention to along the
                    way.
                </p>
            </div>
            <FounderTransformation />
        </details>
    );
}
