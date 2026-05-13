"use client";

import Link from "next/link";
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

export default function InsideTheCourseClient() {
    const { ref: heroRef, inView: heroIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });
    const { ref: gridRef, inView: gridIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />
            <SiteBreadcrumbs />

            <main>
                {/* Hero */}
                <section
                    ref={heroRef}
                    className='mx-auto max-w-6xl px-6 pb-14 pt-14 sm:pb-20 sm:pt-20'>
                    <FadeIn
                        inView={heroIn}
                        delayMs={100}>
                        <div className='space-y-6 bg-background/35 rounded-3xl p-6'>
                            <Badge
                                variant='secondary'
                                className='w-fit'>
                                Course Library
                            </Badge>

                            <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
                                What&apos;s waiting inside.
                            </h1>

                            <p className='max-w-3xl text-lg leading-8'>
                                Your access begins the moment you enroll.
                                Everything is organized, searchable, and yours
                                to return to anytime &mdash; for life.
                            </p>

                            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                                <Button
                                    asChild
                                    className='h-12 px-6'>
                                    <Link href='/#courses'>Shop</Link>
                                </Button>
                                <Button
                                    asChild
                                    variant='secondary'
                                    className='h-12 px-6'>
                                    <Link href='/what-is-it'>What Is It?</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Lauren's intro video placeholder */}
                        <div className='mt-8 rounded-3xl border bg-card overflow-hidden'>
                            <div className='aspect-video flex items-center justify-center bg-muted'>
                                <div className='text-center space-y-3 px-6'>
                                    <p className='text-sm font-medium'>
                                        A personal introduction from Lauren
                                    </p>
                                    <p className='text-xs text-muted-foreground max-w-sm mx-auto'>
                                        Lauren will walk you through everything
                                        inside the course &mdash; in her own
                                        words. Video coming soon.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </section>

                {/* Content */}
                <section
                    ref={gridRef}
                    className='border-t'>
                    <div className='mx-auto max-w-6xl px-6 py-14 sm:py-20'>
                        <FadeIn
                            inView={gridIn}
                            delayMs={150}>
                            <div className='grid gap-10 md:grid-cols-2'>
                                <div className='space-y-6 bg-background/35 rounded-3xl p-6'>
                                    <h2 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
                                        What you get
                                    </h2>

                                    <p className='text-lg leading-8'>
                                        Not a collection of tips. A structured
                                        library that teaches cause and effect
                                        &mdash; so every routine decision you
                                        make from here on is an informed one.
                                    </p>

                                    <ul className='space-y-4 text-sm'>
                                        <li>
                                            <p className='font-medium text-foreground'>
                                                Short, focused lessons
                                            </p>
                                            <p>
                                                Clear explanations of the
                                                mechanics &mdash; without the
                                                fluff or the product push.
                                            </p>
                                        </li>
                                        <li>
                                            <p className='font-medium text-foreground'>
                                                Interactive workbook
                                            </p>
                                            <p>
                                                A guided journal built into the
                                                site &mdash; yours to keep and
                                                reference forever.
                                            </p>
                                        </li>
                                        <li>
                                            <p className='font-medium text-foreground'>
                                                Lifetime access
                                            </p>
                                            <p>
                                                One purchase. No subscription.
                                                Return anytime as your hair
                                                changes.
                                            </p>
                                        </li>
                                    </ul>

                                    <Separator />

                                    <div className='rounded-2xl bg-muted p-4'>
                                        <p className='text-xs font-medium'>
                                            The point
                                        </p>
                                        <p className='mt-1 text-sm text-foreground'>
                                            We get paid once because we want you
                                            to be done needing to buy things.
                                            That&apos;s the whole idea.
                                        </p>
                                    </div>
                                </div>

                                <div className='grid gap-4 sm:grid-cols-2'>
                                    {[
                                        {
                                            title: "Your private library",
                                            desc: "Unlock everything instantly. Organized by topic so you can jump to exactly what you need.",
                                        },
                                        {
                                            title: "The fundamentals",
                                            desc: "The things your stylist learned in school that nobody ever passed on to you.",
                                        },
                                        {
                                            title: "Done-for-you guides",
                                            desc: "Downloadable workbook designed to make implementation easy.",
                                        },
                                        {
                                            title: "A routine framework",
                                            desc: "Repeatable, adjustable, and simple enough that you'll actually stick with it.",
                                        },
                                    ].map(s => (
                                        <Card
                                            key={s.title}
                                            className='rounded-2xl'>
                                            <CardHeader>
                                                <CardTitle className='text-sm'>
                                                    {s.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className='text-sm'>
                                                {s.desc}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            <div className='mt-10 flex flex-col gap-3 sm:flex-row sm:items-center'>
                                <Button
                                    asChild
                                    className='h-12 px-6'
                                    variant='secondary'>
                                    <Link href='/meet-your-educator'>
                                        Meet Your Educator
                                    </Link>
                                </Button>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    );
}
