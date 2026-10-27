import { track } from "@vercel/analytics";

type ConversionEvent =
    | "growth_offer_viewed"
    | "growth_purchase_clicked"
    | "growth_preview_opened"
    | "growth_checkout_opened"
    | "growth_checkout_session_created"
    | "growth_checkout_failed"
    | "growth_checkout_closed"
    | "growth_checkout_reported_complete";

/** No answers, symptoms, emails, session IDs, or raw error messages. */
export function trackGrowthEvent(
    name: ConversionEvent,
    data?: {
        unit_amount?: number;
        stage?: "email" | "payment";
        status?: number;
        has_error?: boolean;
    },
): void {
    if (typeof window === "undefined") return;
    try {
        track(name, data);
    } catch {
        // Telemetry must never prevent checkout or access to the routine.
    }
}
