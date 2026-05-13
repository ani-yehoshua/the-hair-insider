"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";
import { ExternalLink } from "lucide-react";

type Recommendation = {
    product_id: string;
    reason: string;
};

type Product = {
    id: string;
    title: string;
    merchant: string;
    shopmy_url: string;
    collection_name: string | null;
};

type ProfileData = {
    ai_summary: string;
    recommended_product_ids: Recommendation[];
};

export default function HairQuizResultsClient() {
    const router = useRouter();
    const { signedIn, loading: authLoading } = useAuth();

    const [profile, setProfile] = React.useState<ProfileData | null>(null);
    const [products, setProducts] = React.useState<Record<string, Product>>({});
    const [loading, setLoading] = React.useState(true);
    const [err, setErr] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (authLoading || !signedIn) return;

        const load = async () => {
            setLoading(true);
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;
            if (!token) return;

            // Submit any pending answers saved before sign-in
            try {
                const pending = sessionStorage.getItem("pendingQuizAnswers");
                if (pending) {
                    sessionStorage.removeItem("pendingQuizAnswers");
                    await fetch("/api/hair-profile/submit", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ answers: JSON.parse(pending) }),
                    });
                }
            } catch {}

            const res = await fetch("/api/hair-profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();

            if (!res.ok || !json.profile) {
                setErr("No results found. Please take the quiz first.");
                setLoading(false);
                return;
            }

            setProfile(json.profile);

            // Fetch product details for recommendations
            const ids = (
                json.profile.recommended_product_ids as Recommendation[]
            ).map(r => r.product_id);
            if (ids.length > 0) {
                const { data: productData } = await supabase
                    .from("product_catalog")
                    .select("id, title, merchant, shopmy_url, collection_name")
                    .in("id", ids);

                const map: Record<string, Product> = {};
                for (const p of productData ?? []) {
                    map[p.id] = p;
                }
                setProducts(map);
            }

            setLoading(false);
        };

        load();
    }, [authLoading, signedIn]);

    const { ref: pageRef, inView: pageIn } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    if (authLoading) return null;

    if (!signedIn) {
        return (
            <div className='relative min-h-[100dvh] text-foreground'>
                <Overlay />
                <Navbar />
                <main className='mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center gap-6'>
                    <h1 className='text-2xl font-semibold tracking-tight'>
                        Your results are ready
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Sign in to see your personalized hair profile and product recommendations.
                    </p>
                    <Button asChild>
                        <Link href='/signin?next=/hair-type-quiz/results'>
                            Sign in to view results
                        </Link>
                    </Button>
                    <Button asChild variant='secondary'>
                        <Link href='/hair-type-quiz'>Retake the quiz</Link>
                    </Button>
                </main>
            </div>
        );
    }

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />
            <SiteBreadcrumbs />

            <main
                ref={pageRef}
                className='mx-auto max-w-3xl px-6 py-14 sm:py-20'>
                <FadeIn
                    inView={pageIn}
                    delayMs={100}>
                    {loading ? (
                        <p className='text-sm'>Loading your results…</p>
                    ) : err ? (
                        <div className='space-y-4'>
                            <p className='text-sm text-destructive'>{err}</p>
                            <Button asChild>
                                <Link href='/hair-type-quiz'>
                                    Take the quiz
                                </Link>
                            </Button>
                        </div>
                    ) : profile ? (
                        <div className='space-y-10'>
                            {/* Header */}
                            <div className='space-y-3'>
                                <Badge variant='secondary'>
                                    Your Hair Profile
                                </Badge>
                                <h1 className='text-3xl font-semibold tracking-tight'>
                                    Your Results
                                </h1>
                            </div>

                            {/* AI Summary */}
                            <Card className='rounded-3xl'>
                                <CardHeader>
                                    <CardTitle className='text-base'>
                                        Your Hair Profile
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='space-y-3 text-sm leading-7'>
                                        {profile.ai_summary
                                            .split("\n\n")
                                            .map((para, i) => (
                                                <p key={i}>{para}</p>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Separator />

                            {/* Recommendations */}
                            <div className='space-y-4'>
                                <div>
                                    <h2 className='text-xl font-semibold tracking-tight'>
                                        Recommended Products
                                    </h2>
                                    <p className='mt-1 text-sm'>
                                        Curated for your specific hair profile
                                        by Lauren.
                                    </p>
                                </div>

                                <div className='grid gap-4 sm:grid-cols-2'>
                                    {profile.recommended_product_ids.map(
                                        rec => {
                                            const product =
                                                products[rec.product_id];
                                            if (!product) return null;

                                            return (
                                                <Card
                                                    key={rec.product_id}
                                                    className='rounded-2xl'>
                                                    <CardContent className='pt-4 space-y-3'>
                                                        <div>
                                                            <p className='text-sm font-medium leading-snug'>
                                                                {product.title}
                                                            </p>
                                                            <p className='text-xs text-muted-foreground mt-0.5'>
                                                                {product.merchant}
                                                            </p>
                                                        </div>
                                                        <p className='text-xs leading-5 text-muted-foreground'>
                                                            {rec.reason}
                                                        </p>
                                                        <a
                                                            href={product.shopmy_url}
                                                            target='_blank'
                                                            rel='noreferrer'
                                                            className='inline-flex items-center gap-1.5 text-xs font-medium underline underline-offset-4'>
                                                            Shop now
                                                            <ExternalLink className='h-3 w-3' />
                                                        </a>
                                                    </CardContent>
                                                </Card>
                                            );
                                        },
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* CTAs */}
                            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                                <Button asChild>
                                    <Link href='/account?tab=hair-profile'>
                                        Save to my account
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant='secondary'>
                                    <Link href='/hair-type-quiz'>
                                        Retake the quiz
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </FadeIn>
            </main>
        </div>
    );
}
