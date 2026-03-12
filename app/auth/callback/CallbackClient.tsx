"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function CallbackClient() {
    const router = useRouter();
    const [status, setStatus] = React.useState("Signing you in...");

    React.useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!session) return;

            setStatus("Finalizing your account...");

            try {
                const res = await fetch("/api/stripe/ensure-customer", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}),
                });

                if (!res.ok) {
                    console.error("ensure-customer failed", await res.text());
                }
            } catch (e) {
                console.error("ensure-customer threw:", e);
            }

            const next = localStorage.getItem("postAuthRedirect");
            if (next) localStorage.removeItem("postAuthRedirect");

            router.replace(next || "/");
        });

        return () => subscription.unsubscribe();
    }, [router]);

    return (
        <div className='mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6'>
            <p className='text-3xl font-semibold'>{status}</p>
        </div>
    );
}
