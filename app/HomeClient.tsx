"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Overlay } from "@/components/site/Overlay";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";
import { OrgJsonLd } from "@/components/seo/OrgJsonLd";
import { supabase } from "@/lib/supabase/client";
import { startCheckout } from "@/lib/stripe/checkout";
import { ChevronDown, ChevronUp } from "lucide-react";

type Course = {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    cover_image_url: string | null;
    stripe_price_id: string | null;
    overview_video_url: string | null;
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
                    <p className='text-sm'>Cover image</p>
                </div>
            )}

            <CardContent className='px-5 pb-1 space-y-4'>
                <div className='flex items-start justify-between gap-3'>
                    <div className='space-y-1'>
                        <h2 className='text-lg font-semibold leading-snug tracking-tight'>
                            {course.title}
                        </h2>
                        {course.subtitle && (
                            <p className='text-sm'>{course.subtitle}</p>
                        )}
                    </div>
                    {owned && (
                        <Badge className='shrink-0 bg-neutral-500'>Owned</Badge>
                    )}
                </div>

                {stats && (
                    <div className='flex items-center gap-4 text-xs'>
                        <span>{stats.lessonsCount} lessons</span>
                        <span>·</span>
                        <span>{formatDuration(stats.durationSeconds)}</span>
                    </div>
                )}

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

                <button
                    type='button'
                    onClick={() => setOpen(v => !v)}
                    className='flex w-full items-center justify-between text-sm font-medium'>
                    Course details
                    {open ? (
                        <ChevronUp className='h-4 w-4' />
                    ) : (
                        <ChevronDown className='h-4 w-4' />
                    )}
                </button>

                <div
                    className={[
                        "grid transition-all duration-300 ease-in-out",
                        open
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0",
                    ].join(" ")}>
                    <div className='overflow-hidden'>
                        <div className='space-y-4 pt-1 pb-1'>
                            {course.overview_video_url && (
                                <div className='rounded-2xl overflow-hidden aspect-video'>
                                    <iframe
                                        src={course.overview_video_url}
                                        className='w-full h-full'
                                        allow='autoplay; fullscreen; picture-in-picture'
                                        allowFullScreen
                                        title={`${course.title} overview`}
                                    />
                                </div>
                            )}

                            {course.description && (
                                <p className='text-sm leading-7'>
                                    {course.description}
                                </p>
                            )}

                            <div className='grid gap-3 sm:grid-cols-2 pb-3'>
                                <div className='rounded-2xl bg-muted p-4 space-y-2'>
                                    <p className='text-xs font-medium'>
                                        What you get
                                    </p>
                                    <ul className='space-y-1.5 text-xs'>
                                        <li>High-end industry knowledge</li>
                                        <li>Clear routine guidance</li>
                                        <li>Downloadable PDFs</li>
                                        <li>Lifetime access</li>
                                    </ul>
                                </div>
                                <div className='rounded-2xl bg-muted p-4 space-y-2'>
                                    <p className='text-xs font-medium'>
                                        Who it&apos;s for
                                    </p>
                                    <ul className='space-y-1.5 text-xs'>
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

export default function HomeClient() {
    const [courses, setCourses] = React.useState<Course[]>([]);
    const [coursesLoading, setCoursesLoading] = React.useState(true);
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
            setCoursesLoading(true);

            const [{ data: sessionData }, coursesRes] = await Promise.all([
                supabase.auth.getSession(),
                supabase
                    .from("courses")
                    .select(
                        "id, slug, title, subtitle, description, cover_image_url, stripe_price_id, overview_video_url",
                    )
                    .eq("is_published", true)
                    .order("created_at", { ascending: false }),
            ]);

            if (!coursesRes.error && coursesRes.data) {
                setCourses(coursesRes.data);

                coursesRes.data.forEach(async c => {
                    const statsRes = await fetch(
                        `/api/courses/${encodeURIComponent(c.slug)}/stats`,
                    );
                    if (statsRes.ok) {
                        const json = await statsRes.json();
                        setStats(prev => ({ ...prev, [c.id]: json }));
                    }

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

            setCoursesLoading(false);
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

    const { ref: heroRef, inView: heroIn } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });
    const { ref: manifestoRef, inView: manifestoIn } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });
    const { ref: coursesRef, inView: coursesIn } = useInView({
        triggerOnce: true,
        threshold: 0.05,
    });
    const { ref: educatorRef, inView: educatorIn } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <>
            <OrgJsonLd />

            <div className='relative min-h-[100dvh] text-foreground'>
                <Overlay />
                <Navbar />
                <SiteBreadcrumbs />

                <main>
                    {/* Hero */}
                    <section
                        ref={heroRef}
                        className='flex flex-col min-h-[calc(100dvh-64px)]'>
                        <div className='flex-1 flex items-center mx-auto w-full max-w-6xl px-6 py-16'>
                            <FadeIn
                                inView={heroIn}
                                delayMs={100}
                                className='w-full'>
                                <div className='grid gap-10 md:grid-cols-2 md:items-center'>
                                    <div className='space-y-6 bg-background/50 rounded-3xl p-8'>
                                        <p className='text-xs font-semibold uppercase tracking-widest'>
                                            Education-first hair care
                                        </p>
                                        <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
                                            The Education Your Salon Appointment
                                            Never Came With.
                                        </h1>
                                        <p className='max-w-xl text-lg leading-8'>
                                            The Hair Insider is a private course
                                            library that teaches you the{" "}
                                            <em>why</em> behind your hair — so
                                            you stop starting over and finally
                                            build a routine that works.
                                        </p>

                                        <ul className='space-y-2 text-sm'>
                                            <li className='flex items-start gap-2'>
                                                <span className='mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground' />
                                                <span>
                                                    Understand porosity,
                                                    breakage, shedding, and
                                                    moisture — the things your
                                                    stylist learned in school
                                                    that nobody passed on to
                                                    you.
                                                </span>
                                            </li>
                                            <li className='flex items-start gap-2'>
                                                <span className='mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground' />
                                                <span>
                                                    Build a simple, repeatable
                                                    routine with what you
                                                    already own — no new
                                                    products required.
                                                </span>
                                            </li>
                                            <li className='flex items-start gap-2'>
                                                <span className='mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground' />
                                                <span>
                                                    Know how to troubleshoot
                                                    when something changes,
                                                    instead of starting from
                                                    scratch.
                                                </span>
                                            </li>
                                        </ul>

                                        <div className='flex flex-col gap-3 sm:flex-row'>
                                            <Button
                                                asChild
                                                className='h-12 px-6'>
                                                <Link href='/#courses'>
                                                    Browse Courses
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                variant='secondary'
                                                className='h-12 px-6'>
                                                <Link href='/7-day-moisture-reset'>
                                                    Get the Free Guide
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>

                                    <Card className='rounded-3xl'>
                                        <CardHeader className='flex-row items-center justify-between'>
                                            <CardTitle className='text-base'>
                                                Included In The Course
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className='space-y-4'>
                                            <ul className='space-y-4 text-sm'>
                                                <li>
                                                    <p className='font-medium text-foreground'>
                                                        The &ldquo;aha&rdquo;
                                                        moment
                                                    </p>
                                                    <p className='mt-1'>
                                                        Finally understand why
                                                        your hair does what it
                                                        does — not just what to
                                                        do about it.
                                                    </p>
                                                </li>
                                                <li>
                                                    <p className='font-medium text-foreground'>
                                                        A routine you&apos;ll
                                                        actually stick to
                                                    </p>
                                                    <p className='mt-1'>
                                                        Simple, repeatable, and
                                                        built around your life —
                                                        not an influencer&apos;s
                                                        10-step process.
                                                    </p>
                                                </li>
                                                <li>
                                                    <p className='font-medium text-foreground'>
                                                        Workbook that comes home
                                                        with you
                                                    </p>
                                                </li>
                                            </ul>

                                            <Separator />

                                            <div className='rounded-2xl bg-muted p-4'>
                                                <p className='text-xs font-medium'>
                                                    Your stylist knows this.
                                                </p>
                                                <p className='mt-1 text-sm text-foreground'>
                                                    Now you will too.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </FadeIn>
                        </div>

                        {/* Bottom trust strip */}
                        <div className='bg-background/50'>
                            <div className='mx-auto max-w-6xl px-6 py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-semibold'>
                                <span>One purchase</span>
                                <span className='hidden sm:inline'>·</span>
                                <span>Lifetime access</span>
                                <span className='hidden sm:inline'>·</span>
                                <span>Instant unlock</span>
                                <span className='hidden sm:inline'>·</span>
                                <span>No subscription</span>
                                <span className='hidden sm:inline'>·</span>
                                <span>7-day money-back guarantee</span>
                            </div>
                        </div>
                    </section>

                    {/* Manifesto */}
                    <section
                        ref={manifestoRef}
                        className='min-h-[100dvh] flex flex-col justify-center border-t'>
                        <div className='mx-auto max-w-6xl px-6 py-20 w-full'>
                            <FadeIn
                                inView={manifestoIn}
                                delayMs={150}>
                                <div className='bg-background/50 p-6 mb-6 rounded-3xl'>
                                    <p className='text-sm font-semibold uppercase tracking-widest mb-4'>
                                        Why it exists
                                    </p>

                                    <p className='text-3xl sm:text-4xl font-semibold italic leading-tight max-w-3xl'>
                                        &ldquo;The hair industry runs on what
                                        you don&apos;t know. We&apos;re closing
                                        that gap.&rdquo;
                                    </p>
                                </div>

                                <div className='grid gap-4 md:grid-cols-3'>
                                    {[
                                        {
                                            stat: "01",
                                            claim: "You don\u2019t have a product problem.",
                                            detail: "You have a knowledge problem. The average person buys new products trying to fix something that no product was ever going to fix. We teach you what\u2019s actually happening instead.",
                                        },
                                        {
                                            stat: "02",
                                            claim: "Your stylist\u2019s knowledge shouldn\u2019t be a secret.",
                                            detail: "The hair industry runs on information asymmetry \u2014 stylists know things clients don\u2019t, and that gap is where trial and error lives. Lauren bridges it.",
                                        },
                                        {
                                            stat: "03",
                                            claim: "Simple routines work. Complicated ones don\u2019t.",
                                            detail: "Consistency beats complexity every time. The 10-step routine is a product company\u2019s dream. A 3-step routine you actually do is yours.",
                                        },
                                    ].map(item => (
                                        <Card
                                            key={item.stat}
                                            className='rounded-3xl'>
                                            <CardHeader>
                                                <p className='text-xs font-medium'>
                                                    {item.stat}
                                                </p>
                                                <CardTitle className='text-lg leading-snug'>
                                                    {item.claim}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className='text-sm leading-relaxed'>
                                                {item.detail}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <div className='mt-12 flex flex-col sm:flex-row sm:items-center gap-6'>
                                    <Button
                                        asChild
                                        variant='default'
                                        className='h-12 px-6'>
                                        <Link href='/what-is-it'>
                                            Learn more
                                        </Link>
                                    </Button>
                                    <p className='text-sm font-semibold bg-background/50 rounded-xl p-3'>
                                        Education-first &middot; Product-neutral
                                        &middot; Built by a licensed stylist
                                    </p>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* Courses */}
                    <section
                        ref={coursesRef}
                        id='courses'
                        className='min-h-[100dvh] flex flex-col justify-center border-t'>
                        <div className='mx-auto max-w-6xl px-6 py-20 w-full'>
                            <FadeIn
                                inView={coursesIn}
                                delayMs={150}>
                                {/* Single-card: two-column layout */}
                                {!coursesLoading && courses.length === 1 && (
                                    <div className='grid gap-10 md:grid-cols-2 md:items-start'>
                                        {/* Left: section info + trust details */}
                                        <div className='space-y-8'>
                                            <div className='space-y-3 bg-background/50 rounded-3xl p-6'>
                                                <p className='text-sm font-semibold uppercase tracking-widest'>
                                                    Course library
                                                </p>
                                                <h2 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
                                                    Everything starts here.
                                                </h2>
                                                <p className='text-lg'>
                                                    One purchase unlocks your
                                                    full library — instantly,
                                                    forever. Work through it at
                                                    your own pace.
                                                </p>
                                            </div>

                                            <div className='grid grid-cols-2 gap-3'>
                                                {[
                                                    {
                                                        label: "Access",
                                                        value: "Instant",
                                                    },
                                                    {
                                                        label: "Subscription",
                                                        value: "None — ever",
                                                    },
                                                    {
                                                        label: "Guarantee",
                                                        value: "7-day refund",
                                                    },
                                                    {
                                                        label: "Guides",
                                                        value: "Yours to keep",
                                                    },
                                                ].map(item => (
                                                    <div
                                                        key={item.label}
                                                        className='rounded-2xl bg-background/50 p-4'>
                                                        <p className='text-xs font-medium'>
                                                            {item.label}
                                                        </p>
                                                        <p className='mt-1 text-sm font-semibold'>
                                                            {item.value}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className='rounded-2xl bg-background/50 p-6 space-y-3'>
                                                <p className='text-xs font-semibold uppercase tracking-widest'>
                                                    What you&apos;re getting
                                                </p>
                                                <ul className='space-y-2 text-sm'>
                                                    {[
                                                        "Short, focused lessons — product education, no fluff",
                                                        "Downloadable workbook to keep forever",
                                                        "A routine framework you can actually maintain",
                                                        "The fundamentals your stylist never had time to explain",
                                                    ].map(item => (
                                                        <li
                                                            key={item}
                                                            className='flex items-start gap-2'>
                                                            <span className='mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground' />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Right: course card */}
                                        <CourseCard
                                            course={courses[0]}
                                            owned={ownedCourseIds.has(
                                                courses[0].id,
                                            )}
                                            priceText={
                                                prices[courses[0].id] ?? null
                                            }
                                            stats={stats[courses[0].id] ?? null}
                                            buying={buying === courses[0].slug}
                                            buyError={
                                                buyErrors[courses[0].id] ?? null
                                            }
                                            onBuy={onBuy}
                                        />
                                    </div>
                                )}

                                {/* Loading / empty / multi-card: grid layout */}
                                {(coursesLoading ||
                                    courses.length === 0 ||
                                    courses.length > 1) && (
                                    <>
                                        <div className='mb-10 space-y-3 bg-background/50 rounded-3xl p-6'>
                                            <p className='text-sm font-semibold uppercase tracking-widest'>
                                                Course library
                                            </p>
                                            <h2 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
                                                Everything starts here.
                                            </h2>
                                            <p className='text-lg max-w-xl'>
                                                One purchase unlocks your full
                                                library — instantly, forever.
                                                Work through it at your own
                                                pace.
                                            </p>
                                        </div>

                                        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                                            {coursesLoading ? (
                                                <Card className='rounded-3xl'>
                                                    <CardContent className='pt-6 text-sm'>
                                                        Loading courses&hellip;
                                                    </CardContent>
                                                </Card>
                                            ) : courses.length === 0 ? (
                                                <Card className='rounded-3xl'>
                                                    <CardContent className='pt-6 text-sm'>
                                                        No courses available
                                                        yet.
                                                    </CardContent>
                                                </Card>
                                            ) : (
                                                courses.map(c => (
                                                    <CourseCard
                                                        key={c.id}
                                                        course={c}
                                                        owned={ownedCourseIds.has(
                                                            c.id,
                                                        )}
                                                        priceText={
                                                            prices[c.id] ?? null
                                                        }
                                                        stats={
                                                            stats[c.id] ?? null
                                                        }
                                                        buying={
                                                            buying === c.slug
                                                        }
                                                        buyError={
                                                            buyErrors[c.id] ??
                                                            null
                                                        }
                                                        onBuy={onBuy}
                                                    />
                                                ))
                                            )}
                                        </div>

                                        <div className='mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3'>
                                            {[
                                                {
                                                    label: "Access",
                                                    value: "Instant",
                                                },
                                                {
                                                    label: "Subscription",
                                                    value: "None — ever",
                                                },
                                                {
                                                    label: "Guarantee",
                                                    value: "7-day refund",
                                                },
                                                {
                                                    label: "Guides",
                                                    value: "Yours to keep",
                                                },
                                            ].map(item => (
                                                <div
                                                    key={item.label}
                                                    className='rounded-3xl bg-background/50 p-4'>
                                                    <p className='text-xs font-medium'>
                                                        {item.label}
                                                    </p>
                                                    <p className='mt-1 text-sm font-semibold'>
                                                        {item.value}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </FadeIn>
                        </div>
                    </section>

                    {/* Educator */}
                    <section
                        ref={educatorRef}
                        id='educator'
                        className='min-h-[100dvh] flex items-center border-t'>
                        <div className='mx-auto max-w-6xl px-6 py-20 w-full'>
                            <FadeIn
                                inView={educatorIn}
                                delayMs={200}>
                                <div className='grid gap-10 md:grid-cols-2 md:items-stretch'>
                                    <div className='space-y-6 bg-background/50 rounded-3xl p-8 flex flex-col justify-between'>
                                        <div className='space-y-5'>
                                            <p className='text-sm font-semibold uppercase tracking-widest'>
                                                Meet your educator
                                            </p>
                                            <h2 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
                                                Lauren Jackson
                                            </h2>
                                            <p className='text-xl leading-8 italic font-medium'>
                                                &ldquo;I was a licensed stylist,
                                                and I still didn&apos;t know how
                                                to grow my own hair.&rdquo;
                                            </p>
                                            <p className='text-base leading-8'>
                                                Lauren is a licensed
                                                cosmetologist with 8 years
                                                behind the chair. She built The
                                                Hair Insider because she kept
                                                watching clients leave salons
                                                confused — with instructions,
                                                but no understanding.
                                            </p>
                                            <p className='text-base leading-8'>
                                                What she saw over and over
                                                wasn&apos;t a product problem.
                                                It was a clarity problem.
                                            </p>
                                        </div>

                                        <div className='space-y-6'>
                                            <div className='grid grid-cols-2 gap-3'>
                                                {[
                                                    {
                                                        label: "Specialty",
                                                        value: "Color + Extensions",
                                                    },
                                                    {
                                                        label: "Experience",
                                                        value: "8 years behind the chair",
                                                    },
                                                    {
                                                        label: "Approach",
                                                        value: "Routine-based education",
                                                    },
                                                    {
                                                        label: "Focus",
                                                        value: "Health + length retention",
                                                    },
                                                ].map(item => (
                                                    <div
                                                        key={item.label}
                                                        className='rounded-2xl bg-muted p-4'>
                                                        <p className='text-xs font-medium'>
                                                            {item.label}
                                                        </p>
                                                        <p className='mt-1 text-sm'>
                                                            {item.value}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            <Button
                                                asChild
                                                className='h-12 px-6'>
                                                <Link href='/meet-your-educator'>
                                                    Her Story
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className='rounded-3xl border bg-card shadow-sm overflow-hidden flex flex-col'>
                                        <div className='relative flex-1 min-h-[400px]'>
                                            <Image
                                                src='/Lauren_headshot.jpg'
                                                alt='Lauren Jackson, founder of The Hair Insider'
                                                fill
                                                className='object-cover'
                                                sizes='(min-width: 768px) 520px, 100vw'
                                                priority={false}
                                            />
                                        </div>

                                        <div className='p-6 space-y-1'>
                                            <p className='text-sm font-semibold'>
                                                Lauren Jackson
                                            </p>
                                            <p className='text-xs'>
                                                Founder &amp; Educator, The Hair
                                                Insider
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    <Footer />
                </main>
            </div>
        </>
    );
}
