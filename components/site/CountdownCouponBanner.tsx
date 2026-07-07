"use client";

import * as React from "react";

type PromoInfo = {
    active: boolean;
    expiresAt: number | null; // unix seconds
    percentOff: number | null;
    amountOff: number | null; // cents
    currency: string | null;
};

function formatDiscount(promo: PromoInfo): string {
    if (promo.percentOff) return `${promo.percentOff}% off`;
    if (promo.amountOff != null) {
        const amount = (promo.amountOff / 100).toLocaleString("en-US", {
            style: "currency",
            currency: (promo.currency ?? "usd").toUpperCase(),
        });
        return `${amount} off`;
    }
    return "A discount";
}

function formatRemaining(msLeft: number): string {
    const totalSeconds = Math.max(0, Math.floor(msLeft / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Drop-in countdown banner for a Stripe promotion code. Pass the
 * customer-facing `code` (e.g. "GROWTH10") — the discount amount and
 * expiration are read live from Stripe, so the banner always matches
 * whatever's configured there. Renders nothing if the code is missing,
 * inactive, expired, or has no expiration set.
 */
export function CountdownCouponBanner({
    code,
    className = "",
}: {
    code: string;
    className?: string;
}) {
    const [promo, setPromo] = React.useState<PromoInfo | null>(null);
    const [msLeft, setMsLeft] = React.useState<number | null>(null);

    React.useEffect(() => {
        let cancelled = false;
        fetch("/api/stripe/promotion-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
        })
            .then(res => (res.ok ? res.json() : null))
            .then(json => {
                if (!cancelled && json) setPromo(json);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [code]);

    React.useEffect(() => {
        if (!promo?.active || !promo.expiresAt) return;

        const tick = () => {
            setMsLeft(promo.expiresAt! * 1000 - Date.now());
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [promo]);

    if (!promo?.active || !promo.expiresAt || msLeft == null || msLeft <= 0) {
        return null;
    }

    return (
        <div
            className={`rounded-2xl bg-red-600/80 text-white px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium ${className}`}>
            <span>{formatDiscount(promo)}</span>
            <span className='opacity-70'>·</span>
            <span>
                Ends in{" "}
                <span className='font-mono tabular-nums'>
                    {formatRemaining(msLeft)}
                </span>
            </span>
        </div>
    );
}
