"use client";

import * as React from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

type Profile = {
    ai_summary: string;
    recommended_product_ids: Recommendation[];
    updated_at: string;
};

export function HairProfileTab() {
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [products, setProducts] = React.useState<Record<string, Product>>({});
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const load = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;
            if (!token) {
                setLoading(false);
                return;
            }

            const res = await fetch("/api/hair-profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();

            if (res.ok && json.profile) {
                setProfile(json.profile);

                const ids = (
                    json.profile.recommended_product_ids as Recommendation[]
                ).map(r => r.product_id);
                if (ids.length > 0) {
                    const { data: productData } = await supabase
                        .from("product_catalog")
                        .select(
                            "id, title, merchant, shopmy_url, collection_name",
                        )
                        .in("id", ids);

                    const map: Record<string, Product> = {};
                    for (const p of productData ?? []) map[p.id] = p;
                    setProducts(map);
                }
            }

            setLoading(false);
        };

        load();
    }, []);

    if (loading) {
        return (
            <p className='text-sm text-muted-foreground'>
                Loading your hair profile…
            </p>
        );
    }

    if (!profile) {
        return (
            <Card className='rounded-3xl'>
                <CardHeader>
                    <CardTitle className='text-base'>
                        No hair profile yet
                    </CardTitle>
                    <CardDescription>
                        Take the hair type quiz to get a personalized profile
                        and product recommendations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href='/hair-type-quiz'>Take the Quiz</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const takenAt = new Date(profile.updated_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <p className='text-xs text-muted-foreground'>
                    Last updated {takenAt}
                </p>
                <Button
                    asChild
                    variant='secondary'
                    size='sm'>
                    <Link href='/hair-type-quiz'>Retake quiz</Link>
                </Button>
            </div>

            {/* Summary */}
            <Card className='rounded-3xl'>
                <CardHeader>
                    <CardTitle className='text-base'>
                        Your Hair Profile
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-3 text-sm leading-7'>
                        {profile.ai_summary.split("\n\n").map((para, i) => (
                            <p key={i}>{para}</p>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* Recommendations */}
            <div className='space-y-4'>
                <h3 className='text-base font-semibold'>
                    Recommended Products
                </h3>
                <div className='grid gap-3 sm:grid-cols-2'>
                    {profile.recommended_product_ids.map(rec => {
                        const product = products[rec.product_id];
                        if (!product) return null;
                        return (
                            <Card
                                key={rec.product_id}
                                className='rounded-2xl'>
                                <CardContent className='pt-4 space-y-2'>
                                    <div>
                                        <p className='text-sm font-medium leading-snug'>
                                            {product.title}
                                        </p>
                                        <p className='text-xs text-muted-foreground mt-0.5'>
                                            {product.merchant}
                                            {product.collection_name &&
                                                ` · ${product.collection_name}`}
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
                                        Shop now{" "}
                                        <ExternalLink className='h-3 w-3' />
                                    </a>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
