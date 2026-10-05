export function ResultsGenerating() {
    return (
        <main
            className="mx-auto flex min-h-[70dvh] w-full max-w-2xl items-center px-6 py-20"
            aria-live="polite"
            aria-busy="true"
        >
            <div className="w-full text-center slide-up">
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground/55">
                    Assessment Complete
                </span>
                <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
                    Building your results
                </h1>
                <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-foreground/70">
                    Organizing your answers and possible starting points.
                </p>

                <div className="mx-auto mt-12 max-w-md">
                    <div className="h-[2px] overflow-hidden rounded-full bg-foreground/10">
                        <div className="results-generating-bar h-full rounded-full bg-foreground" />
                    </div>
                    <div className="mt-5 flex items-center justify-center gap-2 text-[0.65rem] font-medium uppercase tracking-widest text-foreground/45">
                        <span className="results-generating-dot h-1.5 w-1.5 rounded-full bg-sage" />
                        Using your quiz answers
                    </div>
                </div>
            </div>
        </main>
    );
}
