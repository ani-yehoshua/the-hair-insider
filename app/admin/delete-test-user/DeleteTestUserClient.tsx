"use client";

import * as React from "react";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { supabase } from "@/lib/supabase/client";
import { useAdminGuard } from "@/lib/admin/useAdminGuard";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type DeleteResult = {
    email: string;
    supabase: {
        userId: string | null;
        tablesDeleted: Record<string, number>;
        authUserDeleted: boolean;
        error?: string;
    };
    stripe: { customersDeleted: string[]; error?: string };
    resend: { deleted: boolean; error?: string };
};

export default function DeleteTestUserClient() {
    const { ready, unauthorized } = useAdminGuard();

    const [email, setEmail] = React.useState("");
    const [confirmNonTestEmail, setConfirmNonTestEmail] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    const [err, setErr] = React.useState<string | null>(null);
    const [needsOverride, setNeedsOverride] = React.useState(false);
    const [result, setResult] = React.useState<DeleteResult | null>(null);

    const { ref: pageRef, inView: pageIn } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    async function runDelete() {
        const trimmed = email.trim();
        if (!trimmed) return;

        setBusy(true);
        setErr(null);
        setResult(null);

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;
            if (!token) throw new Error("Not authenticated.");

            const res = await fetch("/api/admin/delete-test-user", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: trimmed,
                    ...(confirmNonTestEmail ? { confirmNonTestEmail: true } : {}),
                }),
            });

            const json = await res.json();

            if (!res.ok) {
                if (json.error?.includes('doesn’t look like a test address') || json.error?.includes('doesn\'t look like a test address')) {
                    setNeedsOverride(true);
                }
                throw new Error(json.error || "Delete failed.");
            }

            setNeedsOverride(false);
            setResult(json as DeleteResult);
        } catch (e) {
            setErr(e instanceof Error ? e.message : "Delete failed.");
        } finally {
            setBusy(false);
        }
    }

    if (unauthorized) {
        return (
            <div className="relative min-h-[100dvh] text-foreground">
                <Overlay />
                <Navbar />
                <div className="mx-auto max-w-2xl px-6 pt-24 pb-16 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight mb-3">Access Denied</h1>
                    <p className="text-sm text-foreground">
                        You&apos;re signed in, but this account isn&apos;t on the admin list.
                    </p>
                </div>
            </div>
        );
    }

    if (!ready) return null;

    return (
        <div className="relative min-h-[100dvh] text-foreground">
            <Overlay />
            <Navbar />
            <SiteBreadcrumbs />

            <div ref={pageRef} className="mx-auto max-w-2xl px-6 pt-10 pb-16">
                <FadeIn inView={pageIn} delayMs={100}>
                    <div className="flex items-center gap-3 mb-1">
                        <Badge variant="secondary">Admin</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight mt-3 mb-2">
                        Delete Test User
                    </h1>
                    <p className="text-sm text-foreground mb-8">
                        Deletes a test account&apos;s Supabase data (entitlements, assessments, profile,
                        pending rows), Stripe customer, and Resend contact in one call. Meant for cleaning
                        up +test addresses, not real customers.
                    </p>

                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-base">Email</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                type="email"
                                placeholder="you+test123@gmail.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setNeedsOverride(false);
                                    setConfirmNonTestEmail(false);
                                }}
                                disabled={busy}
                            />

                            {needsOverride && (
                                <label className="flex items-start gap-2 text-sm text-foreground">
                                    <input
                                        type="checkbox"
                                        className="mt-0.5"
                                        checked={confirmNonTestEmail}
                                        onChange={(e) => setConfirmNonTestEmail(e.target.checked)}
                                    />
                                    This isn&apos;t a &quot;+&quot;-tagged test address, and I still want to
                                    permanently delete it everywhere.
                                </label>
                            )}

                            <Button
                                variant="destructive"
                                disabled={!email.trim() || busy || (needsOverride && !confirmNonTestEmail)}
                                onClick={runDelete}
                            >
                                {busy ? "Deleting…" : "Delete User Everywhere"}
                            </Button>

                            {err && (
                                <div className="flex items-center gap-2 rounded-2xl bg-red-400/20 px-4 py-3 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {err}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {result && (
                        <Card className="rounded-3xl mt-6">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Done: {result.email}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <p className="font-medium mb-1">Supabase</p>
                                    {result.supabase.error ? (
                                        <p className="text-destructive">{result.supabase.error}</p>
                                    ) : result.supabase.userId ? (
                                        <ul className="list-disc pl-5 space-y-0.5 text-foreground/80">
                                            <li>user_id: {result.supabase.userId}</li>
                                            {Object.entries(result.supabase.tablesDeleted).map(([table, count]) => (
                                                <li key={table}>{table}: {count} row(s)</li>
                                            ))}
                                            <li>
                                                auth user: {result.supabase.authUserDeleted ? "deleted" : "not deleted"}
                                            </li>
                                        </ul>
                                    ) : (
                                        <p className="text-foreground/60">No account found for this email.</p>
                                    )}
                                </div>

                                <div>
                                    <p className="font-medium mb-1">Stripe</p>
                                    {result.stripe.error ? (
                                        <p className="text-destructive">{result.stripe.error}</p>
                                    ) : result.stripe.customersDeleted.length > 0 ? (
                                        <ul className="list-disc pl-5 space-y-0.5 text-foreground/80">
                                            {result.stripe.customersDeleted.map((id) => (
                                                <li key={id} className="font-mono text-xs">{id}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-foreground/60">No matching customer found.</p>
                                    )}
                                </div>

                                <div>
                                    <p className="font-medium mb-1">Resend</p>
                                    {result.resend.error ? (
                                        <p className="text-destructive">{result.resend.error}</p>
                                    ) : (
                                        <p className="text-foreground/80">
                                            {result.resend.deleted ? "Contact removed." : "Nothing removed."}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </FadeIn>
            </div>
        </div>
    );
}
