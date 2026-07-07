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
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";

type Product = {
    id: string;
    title: string;
    merchant: string;
    shopmy_url: string;
    destination_url: string;
    collection_name: string | null;
    collection_url: string | null;
    image_url: string | null;
    is_complete: boolean;
};

type EditState = Partial<
    Pick<Product, "title" | "merchant" | "destination_url">
>;

export default function AdminProductsClient() {
    const { ready } = useAdminGuard();

    const [products, setProducts] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [uploading, setUploading] = React.useState(false);
    const [saving, setSaving] = React.useState<string | null>(null);
    const [err, setErr] = React.useState<string | null>(null);
    const [ok, setOk] = React.useState<string | null>(null);
    const [edits, setEdits] = React.useState<Record<string, EditState>>({});
    const [imageEditing, setImageEditing] = React.useState<string | null>(null);
    const [imageInput, setImageInput] = React.useState("");
    const fileRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (!ready) return;
        loadProducts();
    }, [ready]);

    async function fetchMissingImages(list: Product[]) {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) return;

        const missing = list.filter(p => !p.image_url && p.shopmy_url);
        for (const product of missing) {
            try {
                const res = await fetch(
                    `/api/admin/og-image?url=${encodeURIComponent(product.shopmy_url)}`,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
                const json = await res.json();
                if (!json.imageUrl) continue;

                await fetch(`/api/admin/products/${product.id}`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ image_url: json.imageUrl }),
                });

                setProducts(prev =>
                    prev.map(p =>
                        p.id === product.id
                            ? { ...p, image_url: json.imageUrl }
                            : p,
                    ),
                );
            } catch {}
        }
    }

    async function loadProducts() {
        setLoading(true);
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) return;

        const res = await fetch("/api/admin/products", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) {
            setErr(json.error || "Failed to load products.");
        } else {
            // incomplete first
            const sorted = (json.products as Product[]).sort((a, b) => {
                if (a.is_complete === b.is_complete)
                    return a.title.localeCompare(b.title);
                return a.is_complete ? 1 : -1;
            });
            setProducts(sorted);
            fetchMissingImages(sorted);
        }
        setLoading(false);
    }

    async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setErr(null);
        setOk(null);
        setUploading(true);

        try {
            const text = await file.text();
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;
            if (!token) throw new Error("Not authenticated.");

            const res = await fetch("/api/admin/products/seed", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ csv: text }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Seed failed.");

            setOk(
                `Imported ${json.upserted} products (${json.skipped} skipped: missing ShopMy URL).`,
            );
            await loadProducts();
        } catch (e) {
            setErr(e instanceof Error ? e.message : "Upload failed.");
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    }

    async function onSave(product: Product) {
        const patch = edits[product.id];
        if (!patch || Object.keys(patch).length === 0) return;

        setSaving(product.id);
        setErr(null);

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;
            if (!token) throw new Error("Not authenticated.");

            const res = await fetch(`/api/admin/products/${product.id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(patch),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Save failed.");

            setProducts(prev =>
                prev
                    .map(p =>
                        p.id === product.id ? { ...p, ...json.product } : p,
                    )
                    .sort((a, b) => {
                        if (a.is_complete === b.is_complete)
                            return a.title.localeCompare(b.title);
                        return a.is_complete ? 1 : -1;
                    }),
            );
            setEdits(prev => {
                const next = { ...prev };
                delete next[product.id];
                return next;
            });
        } catch (e) {
            setErr(e instanceof Error ? e.message : "Save failed.");
        } finally {
            setSaving(null);
        }
    }

    function getValue(product: Product, field: keyof EditState): string {
        return edits[product.id]?.[field] ?? (product[field] as string) ?? "";
    }

    function setField(
        productId: string,
        field: keyof EditState,
        value: string,
    ) {
        setEdits(prev => ({
            ...prev,
            [productId]: { ...prev[productId], [field]: value },
        }));
    }

    async function saveImageUrl(productId: string, url: string) {
        const trimmed = url.trim();
        setImageEditing(null);
        setImageInput("");
        if (!trimmed) return;

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) return;

        const res = await fetch(`/api/admin/products/${productId}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ image_url: trimmed }),
        });

        if (res.ok) {
            setProducts(prev =>
                prev.map(p =>
                    p.id === productId ? { ...p, image_url: trimmed } : p,
                ),
            );
        }
    }

    const incompleteCount = products.filter(p => !p.is_complete).length;

    const { ref: pageRef, inView: pageIn } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    if (!ready) return null;

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />
            <SiteBreadcrumbs />

            <div
                ref={pageRef}
                className='mx-auto max-w-7xl px-6 pt-8 pb-16'>
                <FadeIn
                    inView={pageIn}
                    delayMs={100}>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-background/50 rounded-3xl p-6'>
                        <div>
                            <div className='flex items-center gap-3'>
                                <Badge variant='secondary'>Admin</Badge>
                            </div>
                            <h1 className='mt-3 text-3xl font-semibold tracking-tight'>
                                Product Catalog
                            </h1>
                            <p className='mt-2 text-sm'>
                                {products.length} products total
                                {incompleteCount > 0 && (
                                    <span className='ml-2 text-destructive font-medium'>
                                        · {incompleteCount} incomplete
                                    </span>
                                )}
                            </p>
                        </div>

                        <div>
                            <input
                                ref={fileRef}
                                type='file'
                                accept='.csv'
                                className='hidden'
                                onChange={onUpload}
                            />
                            <Button
                                onClick={() => fileRef.current?.click()}
                                disabled={uploading}
                                className='gap-2'>
                                <Upload className='h-4 w-4' />
                                {uploading ? "Importing…" : "Upload CSV"}
                            </Button>
                        </div>
                    </div>

                    {err && (
                        <div className='mt-4 flex items-center gap-2 rounded-2xl bg-red-400/20 px-4 py-3 text-sm text-destructive'>
                            <AlertCircle className='h-4 w-4 shrink-0' />
                            {err}
                        </div>
                    )}
                    {ok && (
                        <div className='mt-4 flex items-center gap-2 rounded-2xl bg-green-400/50 px-4 py-3 text-sm text-foreground'>
                            <CheckCircle2 className='h-4 w-4 shrink-0' />
                            {ok}
                        </div>
                    )}

                    <Separator className='my-8' />

                    {loading ? (
                        <p className='text-sm'>Loading…</p>
                    ) : products.length === 0 ? (
                        <Card className='rounded-3xl'>
                            <CardHeader>
                                <CardTitle className='text-base'>
                                    No products yet
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='text-sm'>
                                Upload a ShopMy CSV to seed the catalog.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className='space-y-3'>
                            {products.map(product => {
                                const hasEdits =
                                    Object.keys(edits[product.id] ?? {})
                                        .length > 0;
                                const isSaving = saving === product.id;

                                return (
                                    <Card
                                        key={product.id}
                                        className={`rounded-2xl ${!product.is_complete ? "border-destructive bg-destructive/35" : ""}`}>
                                        <CardContent className='pt-4'>
                                            <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                                                <div className='flex items-center gap-3 shrink-0'>
                                                    {imageEditing === product.id ? (
                                                        <input
                                                            autoFocus
                                                            type='text'
                                                            placeholder='Paste image URL…'
                                                            value={imageInput}
                                                            onChange={e => setImageInput(e.target.value)}
                                                            onBlur={() => saveImageUrl(product.id, imageInput)}
                                                            onKeyDown={e => {
                                                                if (e.key === "Enter") saveImageUrl(product.id, imageInput);
                                                                if (e.key === "Escape") { setImageEditing(null); setImageInput(""); }
                                                            }}
                                                            className='h-8 w-48 rounded-lg border bg-background px-2 text-xs'
                                                        />
                                                    ) : product.image_url ? (
                                                        <img
                                                            src={product.image_url}
                                                            alt={product.title}
                                                            title='Click to change image'
                                                            onClick={() => { setImageEditing(product.id); setImageInput(product.image_url ?? ""); }}
                                                            className='h-12 w-12 rounded-lg object-cover border shrink-0 cursor-pointer hover:opacity-70 transition-opacity'
                                                        />
                                                    ) : (
                                                        <div
                                                            title='Click to add image'
                                                            onClick={() => { setImageEditing(product.id); setImageInput(""); }}
                                                            className='h-12 w-12 rounded-lg bg-muted shrink-0 cursor-pointer hover:bg-muted/60 transition-colors flex items-center justify-center text-muted-foreground text-xs'>
                                                            +
                                                        </div>
                                                    )}
                                                    {product.is_complete ? (
                                                        <CheckCircle2 className='h-4 w-4 text-foreground shrink-0' />
                                                    ) : (
                                                        <AlertCircle className='h-4 w-4 text-destructive shrink-0' />
                                                    )}
                                                    {!product.is_complete && (
                                                        <Badge
                                                            variant='destructive'
                                                            className='text-xs'>
                                                            Incomplete
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className='flex-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                                                    <div className='space-y-1'>
                                                        <p className='text-xs'>
                                                            Title{" "}
                                                            {!product.title && (
                                                                <span className='text-destructive'>
                                                                    *
                                                                </span>
                                                            )}
                                                        </p>
                                                        <Input
                                                            value={getValue(
                                                                product,
                                                                "title",
                                                            )}
                                                            onChange={e =>
                                                                setField(
                                                                    product.id,
                                                                    "title",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder='Product name'
                                                            className={`h-8 text-sm ${!product.is_complete ? "placeholder:text-foreground" : "placeholder:text-muted-foreground"}`}
                                                        />
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <p className='text-xs'>
                                                            Merchant{" "}
                                                            {!product.merchant && (
                                                                <span className='text-destructive'>
                                                                    *
                                                                </span>
                                                            )}
                                                        </p>
                                                        <Input
                                                            value={getValue(
                                                                product,
                                                                "merchant",
                                                            )}
                                                            onChange={e =>
                                                                setField(
                                                                    product.id,
                                                                    "merchant",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder='e.g. Sephora'
                                                            className='h-8 text-sm'
                                                        />
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <p className='text-xs'>
                                                            ShopMy URL
                                                        </p>
                                                        <p className='text-xs font-mono truncate pt-2'>
                                                            {product.shopmy_url}
                                                        </p>
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <p className='text-xs'>
                                                            Destination{" "}
                                                            {!product.destination_url && (
                                                                <span className='text-destructive'>
                                                                    *
                                                                </span>
                                                            )}
                                                        </p>
                                                        <Input
                                                            value={getValue(
                                                                product,
                                                                "destination_url",
                                                            )}
                                                            onChange={e =>
                                                                setField(
                                                                    product.id,
                                                                    "destination_url",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder='https://...'
                                                            className='h-8 text-sm'
                                                        />
                                                    </div>
                                                </div>

                                                <Button
                                                    size='sm'
                                                    disabled={
                                                        !hasEdits || isSaving
                                                    }
                                                    onClick={() =>
                                                        onSave(product)
                                                    }
                                                    className='shrink-0'>
                                                    {isSaving
                                                        ? "Saving…"
                                                        : "Save"}
                                                </Button>
                                            </div>

                                            {product.collection_name && (
                                                <p className='mt-2 text-xs'>
                                                    Collection:{" "}
                                                    {product.collection_name}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </FadeIn>
            </div>
        </div>
    );
}
