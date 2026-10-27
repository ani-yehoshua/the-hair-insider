import { useState } from "react";
import { track } from "@vercel/analytics";
import {
    rememberSavedEmail,
    saveResultsForEmail,
    type AnswerMap,
} from "../lib/assessmentStore";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The step between the "Building your results" screen and the results: an
// email, with no account or code involved. The email gets them a copy of their
// results and a link that reopens them on any device.
export function EmailCapture({
    answers,
    onDone,
}: {
    answers: AnswerMap;
    onDone: () => void;
}) {
    const [email, setEmail] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Set when saving failed on our side, so a server hiccup can never keep
    // someone from the results they just finished the assessment for.
    const [canContinueAnyway, setCanContinueAnyway] = useState(false);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        const trimmed = email.trim();
        if (!EMAIL_RE.test(trimmed)) {
            setError("Please enter a valid email address.");
            return;
        }
        setError(null);
        setSending(true);
        const result = await saveResultsForEmail(trimmed, answers, "results");
        setSending(false);
        if (!result.ok) {
            setError(result.error ?? "Something went wrong. Please try again.");
            setCanContinueAnyway(true);
            return;
        }
        rememberSavedEmail(trimmed.toLowerCase());
        track("email_captured");
        onDone();
    };

    return (
        <main className="mx-auto flex min-h-[70dvh] w-full max-w-2xl items-center px-6 py-20">
            <div className="w-full text-center slide-up">
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground/55">
                    Your Results Are Ready
                </span>
                <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
                    Where should we send them?
                </h1>
                <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-foreground/70">
                    Enter your email to see your results. We&apos;ll send you a
                    copy and a link to reopen them on any device.
                </p>

                <form
                    onSubmit={submit}
                    noValidate
                    className="mx-auto mt-10 max-w-md rounded-2xl border border-foreground/15 bg-border px-5 py-6 text-left"
                >
                    <label
                        htmlFor="results-email"
                        className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/60"
                    >
                        Email address
                    </label>
                    <input
                        id="results-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@email.com"
                        className="mt-3 w-full rounded-xl border border-foreground/25 bg-paper px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground focus:outline-none"
                    />
                    {error && (
                        <p
                            className="mt-3 text-sm text-foreground/80"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={sending}
                        className="mt-4 inline-flex w-full items-center justify-center bg-foreground px-6 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:opacity-50 pill-cta"
                    >
                        {sending ? "One moment…" : "Show my results"}
                    </button>
                    {canContinueAnyway && (
                        <button
                            type="button"
                            onClick={onDone}
                            className="mt-4 w-full text-center text-xs text-foreground/70 underline underline-offset-4"
                        >
                            Continue to my results without saving
                        </button>
                    )}
                    <p className="mt-4 text-xs leading-relaxed text-foreground/60">
                        We&apos;ll also send a few emails about building your
                        routine. Unsubscribe anytime.
                    </p>
                </form>
            </div>
        </main>
    );
}
