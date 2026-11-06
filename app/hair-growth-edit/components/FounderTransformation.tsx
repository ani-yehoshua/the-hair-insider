import { founderTransformation } from "../data/founderTransformation";

export function FounderTransformation() {
    if (!founderTransformation) return null;
    const { beforeImage, afterImage, beforeAlt, afterAlt, caption } =
        founderTransformation;
    return (
        <section
            className="mt-6"
            aria-labelledby="founder-transformation-heading"
            data-testid="founder-transformation"
        >
            <h2
                id="founder-transformation-heading"
                className=" font-serif text-3xl text-foreground"
            >
                My hair, before and after
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3 md:gap-5">
                {[
                    { image: beforeImage, alt: beforeAlt, label: "Before" },
                    { image: afterImage, alt: afterAlt, label: "After" },
                ].map((photo) => (
                    <figure key={photo.label}>
                        <img
                            src={photo.image}
                            alt={photo.alt}
                            width={960}
                            height={1280}
                            className="aspect-[3/4] w-full rounded-2xl bg-paper object-contain"
                            loading="lazy"
                        />
                        <figcaption className="mt-2 text-xs font-medium uppercase tracking-widest text-foreground/70">
                            {photo.label}
                        </figcaption>
                    </figure>
                ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                {caption}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-foreground/60">
                My personal experience, not a promise of the same result for
                your hair. Individual results vary.
            </p>
        </section>
    );
}
