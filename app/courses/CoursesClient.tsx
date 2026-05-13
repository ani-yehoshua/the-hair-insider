"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { supabase } from "@/lib/supabase/client";
import { startCheckout } from "@/lib/stripe/checkout";
import { useAuth } from "@/lib/auth/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";
import { ChevronDown, ChevronUp } from "lucide-react";

type Course = {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    cover_image_url: string | null;
    stripe_price_id: string | null;
};

type Stats = {
    modulesCount: number;
    lessonsCount: number;
    durationSeconds: number;
};

function formatDuration(seconds: number) {
    const m = Math.round(seconds / 60);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem ? `${h} hr ${rem} min` : `${h} hr`;
}

function CourseCard({
    course,
    owned,
    priceText,
    stats,
    buying,
    buyError,
    onBuy,
}: {
    course: Course;
    owned: boolean;
    priceText: string | null;
    stats: Stats | null;
    buying: boolean;
    buyError: string | null;
    onBuy: (slug: string) => void;
}) {
    const [open, setOpen] = React.useState(false);

    return (
        <Card
            id={course.slug}
            className='rounded-3xl overflow-hidden p-0'>
            {/* Cover image */}
            {course.cover_image_url ? (
                <div className='relative aspect-[16/10] w-full'>
                    <Image
                        src={course.cover_image_url}
                        alt={`${course.title} cover`}
                        fill
                        className='object-cover'
                        priority
                    />
                </div>
            ) : (
                <div className='flex aspect-[16/10] items-center justify-center bg-muted'>
                    <p className='text-sm text-muted-foreground'>Cover image</p>
                </div>
            )}

            <CardContent className='px-5 pb-1 space-y-4'>
                {/* Title + owned badge */}
                <div className='flex items-start justify-between gap-3'>
                    <div className='space-y-1'>
                        <h2 className='text-lg font-semibold leading-snug tracking-tight'>
                            {course.title}
                        </h2>
                        {course.subtitle && (
                            <p className='text-sm text-muted-foreground'>
                                {course.subtitle}
                            </p>
                        )}
                    </div>
                    {owned && (
                        <Badge className='shrink-0 bg-neutral-500'>Owned</Badge>
                    )}
                </div>

                {/* Stats row */}
                {stats && (
                    <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                        <span>{stats.lessonsCount} lessons</span>
                        <span>·</span>
                        <span>{formatDuration(stats.durationSeconds)}</span>
                    </div>
                )}

                {/* Price */}
                {course.stripe_price_id && !owned && (
                    <p className='text-3xl font-semibold tracking-tight'>
                        {priceText ?? "—"}
                    </p>
                )}

                {owned && (
                    <p className='text-sm font-medium'>
                        You already own this course.
                    </p>
                )}

                {/* Actions */}
                <div className='flex flex-col gap-2'>
                    {owned ? (
                        <Button
                            asChild
                            className='w-full h-11'>
                            <Link href={`/library/${course.slug}`}>
                                Go to course
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            className='w-full h-11'
                            onClick={() => onBuy(course.slug)}
                            disabled={buying || !course.stripe_price_id}>
                            {buying ? "Redirecting…" : "Buy Now"}
                        </Button>
                    )}
                </div>

                {buyError && (
                    <p className='text-sm text-destructive'>{buyError}</p>
                )}

                <Separator />

                {/* Details toggle */}
                <button
                    type='button'
                    onClick={() => setOpen(v => !v)}
                    className='flex w-full items-center justify-between text-sm font-medium'>
                    Course details
                    {open ? (
                        <ChevronUp className='h-4 w-4 text-muted-foreground' />
                    ) : (
                        <ChevronDown className='h-4 w-4 text-muted-foreground' />
                    )}
                </button>

                {/* Expandable details */}
                <div
                    className={[
                        "grid transition-all duration-300 ease-in-out",
                        open
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0",
                    ].join(" ")}>
                    <div className='overflow-hidden'>
                        <div className='space-y-4 pt-1 pb-1'>
                            {course.description && (
                                <p className='text-sm leading-7 text-muted-foreground'>
                                    {course.description}
                                </p>
                            )}

                            <div className='grid gap-3 sm:grid-cols-2 pb-3'>
                                <div className='rounded-2xl bg-muted p-4 space-y-2'>
                                    <p className='text-xs font-medium'>
                                        What you get
                                    </p>
                                    <ul className='space-y-1.5 text-xs text-muted-foreground'>
                                        <li>High-end industry knowledge</li>
                                        <li>Clear routine guidance</li>
                                        <li>Interactive free guide</li>
                                        <li>Lifetime access</li>
                                    </ul>
                                </div>
                                <div className='rounded-2xl bg-muted p-4 space-y-2'>
                                    <p className='text-xs font-medium'>
                                        Who it&apos;s for
                                    </p>
                                    <ul className='space-y-1.5 text-xs text-muted-foreground'>
                                        <li>People tired of guessing</li>
                                        <li>Anyone wanting healthier length</li>
                                        <li>
                                            Busy routines needing simplicity
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function CoursesClient() {
    const [courses, setCourses] = React.useState<Course[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [ownedCourseIds, setOwnedCourseIds] = React.useState<Set<string>>(
        new Set(),
    );
    const [prices, setPrices] = React.useState<Record<string, string>>({});
    const [stats, setStats] = React.useState<Record<string, Stats>>({});
    const [buying, setBuying] = React.useState<string | null>(null);
    const [buyErrors, setBuyErrors] = React.useState<Record<string, string>>(
        {},
    );

    React.useEffect(() => {
        const run = async () => {
            setLoading(true);

            const [{ data: sessionData }, coursesRes] = await Promise.all([
                supabase.auth.getSession(),
                supabase
                    .from("courses")
                    .select(
                        "id, slug, title, subtitle, description, cover_image_url, stripe_price_id",
                    )
                    .eq("is_published", true)
                    .order("created_at", { ascending: false }),
            ]);

            if (!coursesRes.error && coursesRes.data) {
                setCourses(coursesRes.data);

                // Fetch prices + stats for all courses in parallel
                coursesRes.data.forEach(async c => {
                    // Stats
                    const statsRes = await fetch(
                        `/api/courses/${encodeURIComponent(c.slug)}/stats`,
                    );
                    if (statsRes.ok) {
                        const json = await statsRes.json();
                        setStats(prev => ({ ...prev, [c.id]: json }));
                    }

                    // Price
                    if (c.stripe_price_id) {
                        const priceRes = await fetch("/api/stripe/price", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                priceId: c.stripe_price_id,
                            }),
                        });
                        if (priceRes.ok) {
                            const json = await priceRes.json();
                            if (json.unitAmount != null) {
                                const formatted = new Intl.NumberFormat(
                                    "en-US",
                                    {
                                        style: "currency",
                                        currency: json.currency.toUpperCase(),
                                    },
                                ).format(json.unitAmount / 100);
                                setPrices(prev => ({
                                    ...prev,
                                    [c.id]: formatted,
                                }));
                            }
                        }
                    }
                });
            }

            const userId = sessionData.session?.user?.id;
            if (userId) {
                const { data: ents } = await supabase
                    .from("entitlements")
                    .select("course_id")
                    .eq("user_id", userId)
                    .eq("status", "active");
                if (ents)
                    setOwnedCourseIds(new Set(ents.map(e => e.course_id)));
            }

            setLoading(false);
        };

        run();
    }, []);

    async function onBuy(slug: string) {
        const course = courses.find(c => c.slug === slug);
        if (!course) return;

        setBuyErrors(prev => {
            const n = { ...prev };
            delete n[course.id];
            return n;
        });
        setBuying(slug);

        try {
            await startCheckout(slug);
        } catch (err) {
            setBuyErrors(prev => ({
                ...prev,
                [course.id]:
                    err instanceof Error ? err.message : "Checkout failed.",
            }));
        } finally {
            setBuying(null);
        }
    }

    const { ref: pageRef, inView: pageIn } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />
            <SiteBreadcrumbs />

            <div
                ref={pageRef}
                className='mx-auto max-w-6xl px-6 pt-8 pb-16'>
                <FadeIn
                    inView={pageIn}
                    delayMs={100}>
                    <div className='flex items-end justify-between gap-6'>
                        <div>
                            <h1 className='text-3xl font-semibold tracking-tight'>
                                Courses
                            </h1>
                            <p className='mt-2'>
                                Choose a course and unlock your library access.
                            </p>
                        </div>
                    </div>

                    <div className='mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                        {loading ? (
                            <Card className='rounded-3xl'>
                                <CardContent className='pt-6 text-sm text-muted-foreground'>
                                    Loading courses…
                                </CardContent>
                            </Card>
                        ) : courses.length === 0 ? (
                            <Card className='rounded-3xl'>
                                <CardContent className='pt-6 text-sm text-muted-foreground'>
                                    No courses available yet.
                                </CardContent>
                            </Card>
                        ) : (
                            courses.map(c => (
                                <CourseCard
                                    key={c.id}
                                    course={c}
                                    owned={ownedCourseIds.has(c.id)}
                                    priceText={prices[c.id] ?? null}
                                    stats={stats[c.id] ?? null}
                                    buying={buying === c.slug}
                                    buyError={buyErrors[c.id] ?? null}
                                    onBuy={onBuy}
                                />
                            ))
                        )}
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
