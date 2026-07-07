"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
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

export default function WorkbookUpgradePage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    async function onBuy() {
        setLoading(true);
        setError(null);

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (!token) {
            router.push("/signin?next=/workbook");
            return;
        }

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ courseSlug: "hair-growth-workbook" }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Checkout failed.");

            window.location.href = json.url;
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
            setLoading(false);
        }
    }

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />

            <main className='mx-auto max-w-2xl px-6 py-20'>
                <Card className='rounded-3xl'>
                    <CardHeader className='space-y-3'>
                        <CardTitle className='text-2xl'>
                            Hair Growth Workbook
                        </CardTitle>
                        <CardDescription className='text-base leading-relaxed'>
                            A digital guided journal and companion to the mini
                            course. SMART goals, habit tracking, daily
                            check-ins, and weekly reviews to lock in your hair
                            routine, for good.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <ul className='space-y-2 text-sm text-muted-foreground'>
                            <li>✓ SMART goal-setting worksheet</li>
                            <li>✓ Habit tracker &amp; streak counter</li>
                            <li>✓ Wheel of alignment exercise</li>
                            <li>✓ Action priority matrix</li>
                            <li>✓ Daily journal</li>
                            <li>✓ Weekly progress review</li>
                        </ul>

                        {error && (
                            <p className='text-sm text-destructive'>{error}</p>
                        )}

                        <Button
                            onClick={onBuy}
                            disabled={loading}
                            className='w-full sm:w-auto'>
                            {loading ? "Redirecting…" : "Get the Digital Workbook"}
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
