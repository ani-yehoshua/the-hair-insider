"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CourseRow = {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
};

type EntitledCourseRow = {
    status: string;
    courses: CourseRow[];
};

type LibraryItem = {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    href: string | null;
    cta: string;
    locked?: boolean;
    comingSoon?: boolean;
};

const FREE_ITEMS: LibraryItem[] = [
    {
        id: "7-day-moisture-reset",
        title: "7-Day Moisture Reset",
        subtitle: "Daily check-ins, progress tracking, science-backed steps.",
        badge: "Free guide",
        href: "/7-day-moisture-reset",
        cta: "Open guide →",
    },
];

const WORKBOOK_ITEMS: LibraryItem[] = [
    {
        id: "hair-growth-workbook",
        title: "Hair Growth Workbook",
        subtitle: "A guided journal and helper companion to the mini course.",
        badge: "Workbook",
        href: "/workbook",
        cta: "Open workbook →",
    },
];

export function LibraryTab() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [entitledCourses, setEntitledCourses] = React.useState<CourseRow[]>(
        [],
    );

    React.useEffect(() => {
        const run = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
                router.replace(
                    `/signin?next=${encodeURIComponent("/account?tab=library")}`,
                );
                return;
            }

            const { data } = await supabase
                .from("entitlements")
                .select(
                    "status, courses:course_id (id, slug, title, subtitle, cover_image_url)",
                )
                .eq("status", "active");

            const courses = ((data ?? []) as unknown as EntitledCourseRow[])
                .flatMap(row => row.courses ?? [])
                .filter(Boolean);

            setEntitledCourses(courses);
            setLoading(false);
        };

        run();
    }, [router]);

    const courseItems: LibraryItem[] = entitledCourses
        .filter(c => c.slug !== "hair-growth-workbook")
        .map(c => ({
            id: c.id,
            title: c.title,
            subtitle: c.subtitle ?? "",
            badge: "Course",
            href: `/library/${c.slug}`,
            cta: "Open course →",
        }));

    const ownsWorkbook = entitledCourses.some(
        c => c.slug === "hair-growth-workbook",
    );
    const allItems = [
        ...FREE_ITEMS,
        ...courseItems,
        ...(ownsWorkbook ? WORKBOOK_ITEMS : []),
    ];

    return (
        <div>
            {loading ? (
                <p className='text-sm'>Loading your library…</p>
            ) : (
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    {allItems.map(item =>
                        item.href ? (
                            <Link
                                key={item.id}
                                href={item.href}>
                                <Card className='rounded-3xl h-full transition-shadow hover:shadow-md'>
                                    <CardHeader className='space-y-2'>
                                        <Badge
                                            variant='secondary'
                                            className='w-fit text-xs'>
                                            {item.badge}
                                        </Badge>
                                        <CardTitle className='text-base leading-snug'>
                                            {item.title}
                                        </CardTitle>
                                        {item.subtitle && (
                                            <p className='text-sm text-muted-foreground leading-snug'>
                                                {item.subtitle}
                                            </p>
                                        )}
                                    </CardHeader>
                                    <CardContent className='text-sm font-medium'>
                                        {item.cta}
                                    </CardContent>
                                </Card>
                            </Link>
                        ) : (
                            <Card
                                key={item.id}
                                className='rounded-3xl h-full opacity-50 cursor-not-allowed'>
                                <CardHeader className='space-y-2'>
                                    <Badge
                                        variant='secondary'
                                        className='w-fit text-xs'>
                                        {item.badge}
                                    </Badge>
                                    <CardTitle className='text-base leading-snug'>
                                        {item.title}
                                    </CardTitle>
                                    {item.subtitle && (
                                        <p className='text-sm text-muted-foreground leading-snug'>
                                            {item.subtitle}
                                        </p>
                                    )}
                                </CardHeader>
                                <CardContent className='text-sm'>
                                    {item.cta}
                                </CardContent>
                            </Card>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}
