"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type CourseRow = {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    cover_image_url: string | null;
};

type EntitledCourseRow = {
    status: string;
    courses: CourseRow[];
};

type Stats = {
    modulesCount: number;
    lessonsCount: number;
    durationSeconds: number;
};

type LibraryCard = {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    badge: string;
    coverImage: string | null;
    href: string;
    cta: string;
};

function formatDuration(seconds: number) {
    const m = Math.round(seconds / 60);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem ? `${h} hr ${rem} min` : `${h} hr`;
}

function LibraryCardView({
    card,
    stats,
}: {
    card: LibraryCard;
    stats: Stats | null;
}) {
    return (
        <Card className='rounded-3xl overflow-hidden p-0 h-full flex flex-col'>
            {card.coverImage ? (
                <div className='relative aspect-[16/10] w-full shrink-0'>
                    <Image
                        src={card.coverImage}
                        alt={card.title}
                        fill
                        className='object-cover'
                    />
                </div>
            ) : (
                <div className='flex aspect-[16/10] items-center justify-center bg-muted shrink-0'>
                    <p className='text-sm'>Cover image</p>
                </div>
            )}

            <CardContent className='px-5 py-4 flex flex-col flex-1 space-y-3'>
                <div className='flex-1 space-y-1'>
                    <Badge
                        variant='secondary'
                        className='text-xs w-fit'>
                        {card.badge}
                    </Badge>
                    <h3 className='font-semibold leading-snug tracking-tight'>
                        {card.title}
                    </h3>
                    {card.subtitle && (
                        <p className='text-sm leading-snug'>{card.subtitle}</p>
                    )}
                    {stats && (
                        <div className='flex items-center gap-4 text-xs pt-1'>
                            <span>{stats.lessonsCount} lessons</span>
                            <span>·</span>
                            <span>{formatDuration(stats.durationSeconds)}</span>
                        </div>
                    )}
                </div>

                <Button
                    asChild
                    className='w-full h-10'>
                    <Link href={card.href}>{card.cta}</Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export function LibraryTab() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [cards, setCards] = React.useState<LibraryCard[]>([]);
    const [stats, setStats] = React.useState<Record<string, Stats>>({});

    React.useEffect(() => {
        const run = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
                router.replace(
                    `/signin?next=${encodeURIComponent("/account?tab=library")}`,
                );
                return;
            }

            const userId = sessionData.session.user.id;

            const [entitlementsRes, progressRes] = await Promise.all([
                supabase
                    .from("entitlements")
                    .select(
                        "status, courses:course_id (id, slug, title, subtitle, cover_image_url)",
                    )
                    .eq("status", "active"),
                supabase
                    .from("guide_progress")
                    .select("id")
                    .eq("user_id", userId)
                    .limit(1),
            ]);

            const entitledCourses = (
                (entitlementsRes.data ?? []) as unknown as EntitledCourseRow[]
            )
                .flatMap(row => row.courses ?? [])
                .filter(Boolean);

            const hasGuideProgress = (progressRes.data ?? []).length > 0;

            const newCards: LibraryCard[] = [];

            if (hasGuideProgress) {
                newCards.push({
                    id: "7-day-moisture-reset",
                    slug: "7-day-moisture-reset",
                    title: "7-Day Moisture Reset",
                    subtitle:
                        "Daily check-ins, progress tracking, science-backed steps.",
                    badge: "Free digital guide",
                    coverImage: "/free_guide_cover.png",
                    href: "/7-day-moisture-reset",
                    cta: "Continue guide →",
                });
            }

            for (const c of entitledCourses.filter(
                c => c.slug !== "hair-growth-workbook",
            )) {
                newCards.push({
                    id: c.id,
                    slug: c.slug,
                    title: c.title,
                    subtitle: c.subtitle,
                    badge: "Course",
                    coverImage: c.cover_image_url,
                    href: `/library/${c.slug}`,
                    cta: "Open course →",
                });
            }

            const workbook = entitledCourses.find(
                c => c.slug === "hair-growth-workbook",
            );
            if (workbook) {
                newCards.push({
                    id: workbook.id,
                    slug: workbook.slug,
                    title: workbook.title,
                    subtitle: workbook.subtitle,
                    badge: "Digital workbook",
                    coverImage: workbook.cover_image_url,
                    href: "/workbook",
                    cta: "Open digital workbook →",
                });
            }

            setCards(newCards);

            // Fetch stats for courses only
            for (const c of entitledCourses.filter(
                c => c.slug !== "hair-growth-workbook",
            )) {
                fetch(`/api/courses/${encodeURIComponent(c.slug)}/stats`)
                    .then(r => (r.ok ? r.json() : null))
                    .then(json => {
                        if (json) setStats(prev => ({ ...prev, [c.id]: json }));
                    })
                    .catch(() => {});
            }

            setLoading(false);
        };

        run();
    }, [router]);

    return (
        <div>
            {loading ? (
                <p className='text-sm'>Loading your library…</p>
            ) : cards.length === 0 ? (
                <p className='text-sm'>
                    Nothing here yet —{" "}
                    <Link
                        href='/7-day-moisture-reset'
                        className='underline underline-offset-4'>
                        start the free digital guide
                    </Link>{" "}
                    or{" "}
                    <Link
                        href='/#shop'
                        className='underline underline-offset-4'>
                        browse the shop
                    </Link>{" "}
                    to get started.
                </p>
            ) : (
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start'>
                    {cards.map(card => (
                        <LibraryCardView
                            key={card.id}
                            card={card}
                            stats={stats[card.id] ?? null}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
