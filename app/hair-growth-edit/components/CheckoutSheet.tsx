import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { X } from 'lucide-react';
import { track } from '@vercel/analytics';
import { trackGrowthEvent } from '../lib/conversionAnalytics';
import { loadSavedEmail, rememberSavedEmail, saveResultsForEmail, type AnswerMap } from '../lib/assessmentStore';
import { stripePromise } from '@/lib/stripe/embeddedCheckoutClient';
import { growthEditFontVariables } from '../fonts';
import { RoutineCheckoutSummary } from './RoutineCheckoutSummary';
import type { FoundingAvailability } from '../lib/foundingOffer';
const GROWTH_EDIT_SLUG = 'hair-growth-edit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CheckoutSheetProps {
  open: boolean;
  courseSlug: string;
  availability?: FoundingAvailability | null;
  answers: AnswerMap;
  knownEmail?: string | null;
  onClose: () => void;
  onComplete: () => void;
}

// A bottom sheet wrapping Stripe's Embedded Checkout, opened directly from
// the results page. redirect_on_completion: 'if_required' on the server
// side (see app/api/checkout/embedded/route.ts) keeps card completing
// inline via `onComplete` below; only a method that genuinely requires a
// redirect (Klarna, Amazon Pay, etc.) leaves the page, via return_url.
// Unmounting the sheet when closed (rather than just hiding it) forces a
// fresh Checkout Session on next open, since a session used once shouldn't
// be reused.
//
// Portaled to document.body: the results page's own root element has a
// `slide-up` entrance animation, and that animation's `forwards` fill mode
// leaves a `transform` permanently applied even after it finishes. Any
// `transform` on an ancestor creates a new containing block for descendant
// `position: fixed` elements (a CSS-spec quirk), so without the portal this
// sheet would be "fixed" relative to that div instead of the real viewport
// -- explaining both the bad positioning and the page scrolling underneath
// it. The `growth-edit-quiz` class is reapplied here directly because
// portaling moves this DOM subtree out from under that ancestor, and the
// sheet's animation classes are scoped under that selector in globals.css.
export function CheckoutSheet({ open, courseSlug, availability = null, answers, knownEmail = null, onClose, onComplete }: CheckoutSheetProps) {
  // The price the buyer was shown. The server refuses to charge a different one.
  const expectedUnitAmount = availability?.unitAmount ?? null;
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  // The Growth Edit asks for an email before payment (so a visitor who opens
  // checkout and leaves can still be followed up with). Anyone who already
  // gave one, or is signed in, goes straight to payment.
  const needsEmail = courseSlug === GROWTH_EDIT_SLUG;
  const [email, setEmail] = useState('');
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setCheckoutError(null);
    setEmailError(null);
    const known = knownEmail ?? loadSavedEmail();
    setEmail(known ?? '');
    setEmailConfirmed(Boolean(known));
  }, [open, knownEmail]);
  const showEmailStep = needsEmail && !emailConfirmed;
  const closeCheckout = () => {
    trackGrowthEvent('growth_checkout_closed', { stage: showEmailStep ? 'email' : 'payment', has_error: Boolean(checkoutError) });
    onClose();
  };

  const confirmEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError(null);
    setSavingEmail(true);
    // Fail open: payment must never be blocked by the email being recorded.
    await saveResultsForEmail(trimmed, answers, 'checkout');
    rememberSavedEmail(trimmed);
    try { track('checkout_email_captured'); } catch { /* Recording telemetry must not block payment. */ }
    setEmail(trimmed);
    setSavingEmail(false);
    setEmailConfirmed(true);
  };

  const fetchClientSecret = useCallback(async () => {
    let requestStatus = 0;
    try {
      const res = await fetch('/api/checkout/embedded', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseSlug, expectedUnitAmount, email: needsEmail && emailConfirmed ? email : undefined }),
    });
    requestStatus = res.status;
    const data = (await res.json()) as { clientSecret?: string; error?: string };
    if (!res.ok || !data.clientSecret) {
      throw new Error(data.error || 'Could not start checkout.');
    }
      trackGrowthEvent('growth_checkout_session_created');
      return data.clientSecret;
    } catch (failure) {
      trackGrowthEvent('growth_checkout_failed', { status: requestStatus });
      setCheckoutError(failure instanceof Error ? failure.message : 'Could not start checkout.');
      throw failure;
    }
  }, [courseSlug, expectedUnitAmount, needsEmail, emailConfirmed, email]);

  // Plain `overflow: hidden` on <body> doesn't stop touch-scroll on iOS
  // Safari -- it keeps rubber-banding the page underneath regardless. The
  // reliable cross-browser fix is to pin body in place with
  // position: fixed at its current scroll offset, then restore both the
  // styles and the scroll position on close (skipping the restore would
  // otherwise snap the page back to the top every time the sheet closes).
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const { style } = document.body;
    const previous = {
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
      overflow: document.documentElement.style.overflow,
    };

    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.left = '0';
    style.right = '0';
    style.width = '100%';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      style.position = previous.position;
      style.top = previous.top;
      style.left = previous.left;
      style.right = previous.right;
      style.width = previous.width;
      document.documentElement.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className={`growth-edit-quiz ${growthEditFontVariables} fixed inset-0 z-50 flex items-end justify-center bg-black/40 fade-in`}
      onClick={closeCheckout}
    >
      <div
        className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-paper px-5 pb-8 shadow-2xl sheet-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky so the close button stays reachable however far the sheet is scrolled.
            The height cap uses dvh (the visible area), not vh: on phones vh counts the
            browser's address bar as if it were hidden, which pushed the top of the
            sheet -- and its close button -- underneath it. */}
        <div className="sticky top-0 z-10 -mx-5 mb-2 flex justify-center bg-paper px-5 pb-2 pt-4">
          <div className="h-1 w-10 rounded-full bg-foreground/20" />
          <button
            type="button"
          onClick={closeCheckout}
            aria-label="Close checkout"
            className="absolute right-3 top-2 rounded-full p-2 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {courseSlug === GROWTH_EDIT_SLUG && (
          <RoutineCheckoutSummary availability={availability} />
        )}

        {showEmailStep ? (
          <form onSubmit={confirmEmail} noValidate className="pb-4">
            <label htmlFor="checkout-email" className="text-sm font-medium text-foreground">
              Where should we send your plan?
            </label>
            <p className="mt-1 text-xs leading-relaxed text-foreground/65">
              Your receipt and access go to this email. Use the one you&apos;ll sign in with.
            </p>
            <input
              id="checkout-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
              className="mt-3 w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground focus:outline-none"
            />
            {emailError && <p role="alert" className="mt-2 text-sm text-foreground/80">{emailError}</p>}
            <button
              type="submit"
              disabled={savingEmail}
              className="mt-4 inline-flex w-full items-center justify-center bg-foreground px-5 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:opacity-50 pill-cta"
            >
              {savingEmail ? 'One moment…' : 'Continue to payment'}
            </button>
            <p className="mt-3 text-xs leading-relaxed text-foreground/60">
              We&apos;ll also send a few emails about building your routine. Unsubscribe anytime.
            </p>
          </form>
        ) : stripePromise ? (
          checkoutError ? <div role="alert" className="py-8 text-sm leading-relaxed text-foreground/80">
            <p>{checkoutError}</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-4 underline">Refresh price and try again</button>
          </div> : <>
            {needsEmail && email && (
              <p className="mb-3 text-xs text-foreground/65">
                Receipt and access for <strong>{email}</strong>
                {!knownEmail && (
                  <> · <button type="button" onClick={() => setEmailConfirmed(false)} className="underline">Change</button></>
                )}
              </p>
            )}
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret, onComplete }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </>
        ) : (
          <p className="py-12 text-center text-sm text-foreground/70">
            Checkout is not configured yet.
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
