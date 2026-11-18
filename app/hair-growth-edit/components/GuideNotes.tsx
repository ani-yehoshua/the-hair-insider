import { ROUTINE_OFFER } from "../lib/routineOffer";

export function BasedOnAnswers({ className = "" }: { className?: string }) {
    return (
        <p
            className={`text-[0.65rem] font-medium uppercase tracking-[0.16em] text-foreground/65 ${className}`}
        >
            Based on your answers
        </p>
    );
}

export function GuideRefundNote({ location }: { location: string }) {
    return (
        <p
            className="mt-5 border-t border-foreground/15 pt-4 text-xs leading-relaxed text-foreground/75"
            data-testid={`${location}-refund-window`}
        >
            <strong className="font-medium text-foreground">
                {ROUTINE_OFFER.refundWindow}
            </strong>{" "}
            <a href="/terms" target="_blank" rel="noreferrer" className="underline">
                Terms
            </a>
        </p>
    );
}
