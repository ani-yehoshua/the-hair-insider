import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { X } from 'lucide-react';
import { stripePromise } from '@/lib/stripe/embeddedCheckoutClient';

interface CheckoutSheetProps {
  open: boolean;
  courseSlug: string;
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
export function CheckoutSheet({ open, courseSlug, onClose, onComplete }: CheckoutSheetProps) {
  const fetchClientSecret = useCallback(async () => {
    const res = await fetch('/api/checkout/embedded', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseSlug }),
    });
    const data = (await res.json()) as { clientSecret?: string; error?: string };
    if (!res.ok || !data.clientSecret) {
      throw new Error(data.error || 'Could not start checkout.');
    }
    return data.clientSecret;
  }, [courseSlug]);

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
      className="growth-edit-quiz fixed inset-0 z-50 flex items-end justify-center bg-black/40 fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-paper px-5 pb-8 pt-4 shadow-2xl sheet-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-foreground/20" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close checkout"
          className="absolute right-4 top-4 rounded-full p-2 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
        >
          <X size={18} />
        </button>

        {stripePromise ? (
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret, onComplete }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
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
