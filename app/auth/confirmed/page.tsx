"use client";

import * as React from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Overlay } from "@/components/site/Overlay";
import { Button } from "@/components/ui/button";

export default function EmailConfirmedPage() {
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!session) return;

            // Run side effects fire-and-forget
            fetch("/api/stripe/ensure-customer", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            }).catch(() => {});

            fetch("/api/mailchimp/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: session.user.email }),
            }).catch(() => {});

            setReady(true);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />

            <div className='mx-auto max-w-md px-6 py-20 text-center'>
                {ready ? (
                    <>
                        <h1 className='text-3xl font-semibold tracking-tight'>
                            You&apos;re confirmed.
                        </h1>
                        <p className='mt-3 leading-7'>
                            Your email has been verified. You can close this tab
                            and go back to finish signing in on your original
                            device.
                        </p>
                        <p className='mt-2 text-sm'>
                            On the same device? Sign in below.
                        </p>
                        <div className='mt-8'>
                            <Button asChild>
                                <Link href='/signin'>Sign in</Link>
                            </Button>
                        </div>
                    </>
                ) : (
                    <p className='text-lg'>Confirming your email&hellip;</p>
                )}
            </div>
        </div>
    );
}
