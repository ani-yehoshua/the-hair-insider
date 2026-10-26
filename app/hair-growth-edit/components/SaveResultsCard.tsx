import { useState } from "react";
import { track } from "@vercel/analytics";
import {
    loadSavedEmail,
    rememberSavedEmail,
    saveResultsForEmail,
    type AnswerMap,
} from "../lib/assessmentStore";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "Email me my results": gives a signed-out visitor a copy of their results
// and a link that reopens them on any device. Never blocks the results.
export function SaveResultsCard({ answers }: { answers: AnswerMap }) {
    const [email, setEmail] = useState(() => loadSavedEmail() ?? "");
    const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
    const [error, setError] = useState<string | null>(null);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        const trimmed = email.trim();
        if (!EMAIL_RE.test(trimmed)) {
            setError("Please enter a valid email address.");
            return;
        }
        setError(null);
        setStatus("sending");
        const result = await saveResultsForEmail(trimmed, answers, "results");
        if (!result.ok) {
            setStatus("idle");
            setError(result.error ?? "Something went wrong. Please try again.");
            return;
        }
        rememberSavedEmail(trimmed.toLowerCase());
        track("results_emailed");
        setStatus("sent");
    };

    return (
        <section
            className="mb-12 max-w-2xl rounded-2xl border border-foreground/15 bg-border px-5 py-5 md:px-6"
            aria-label="Save your results"
            data-testid="save-results-card"
        >
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/60">
                Save your results
            </span>
            {status === "sent" ? (
                <p
                    className="mt-2 text-sm leading-relaxed text-foreground/80"
                    role="status"
                >
                    Sent to <strong>{email.trim()}</strong>. Check your inbox
                    (and spam) for a link that reopens your results on any
                    device.
                </p>
            ) : (
                <form onSubmit={submit} noValidate>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                        Get a copy of your results by email, and open them on
                        any device.
                    </p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <input
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@email.com"
                            aria-label="Email address"
                            className="min-w-0 flex-1 rounded-lg border border-foreground/25 bg-paper px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={status === "sending"}
                            className="inline-flex items-center justify-center bg-foreground px-6 py-3 text-[0.7rem] font-medium uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:opacity-50 pill-cta"
                        >
                            {status === "sending"
                                ? "Sending…"
                                : "Save my results"}
                        </button>
                    </div>
                    {error && (
                        <p
                            className="mt-3 text-sm text-foreground/80"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}
                    <p className="mt-3 text-xs leading-relaxed text-foreground/60">
                        We&apos;ll also send a few emails about building your
                        routine. Unsubscribe anytime.
                    </p>
                </form>
            )}
        </section>
    );
}
