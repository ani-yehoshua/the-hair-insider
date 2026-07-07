"use client";

import * as React from "react";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

const GROWTH_EDIT_PAYMENT_LINK =
    "https://buy.stripe.com/00wbJ2aP1g7E5LEcyD4c802";

export default function GrowthEditUpgradePage() {
    const [loading, setLoading] = React.useState(false);

    function onBuy() {
        setLoading(true);
        window.location.href = GROWTH_EDIT_PAYMENT_LINK;
    }

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />

            <main className='mx-auto max-w-2xl px-6 py-20'>
                <Card className='rounded-3xl'>
                    <CardHeader className='space-y-3'>
                        <CardTitle className='text-2xl'>
                            The Growth Edit
                        </CardTitle>
                        <CardDescription className='text-base leading-relaxed'>
                            Find your hair type and get a matched, salon-grade
                            product routine — professional Davines picks with an
                            honest, more affordable match for every step.
                            Unlimited use, saved list, and repurchase reminders.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <ul className='space-y-2 text-sm text-muted-foreground'>
                            <li>
                                ✓ Texture, density &amp; curl pattern finder
                            </li>
                            <li>✓ Complete 9-step matched routine</li>
                            <li>
                                ✓ Pro pick + budget-friendly match for every
                                step
                            </li>
                            <li>✓ Save your list &amp; repurchase reminders</li>
                            <li>✓ Unlimited, lifetime access</li>
                        </ul>

                        <Button
                            onClick={onBuy}
                            disabled={loading}
                            className='w-full sm:w-auto'>
                            {loading ? "Redirecting…" : "Get The Growth Edit"}
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
