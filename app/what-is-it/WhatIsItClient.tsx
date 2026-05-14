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

export default function WhatIsItClient() {
    const { ref: heroRef, inView: heroIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    const { ref: detailRef, inView: detailIn } = useInView({
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
                                Education-First Hair Care
                            </Badge>

                            <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
                                You don&apos;t have a product problem.
                            </h1>

                            <p className='max-w-3xl text-lg leading-8'>
                                The Hair Insider is a private course library
                                that teaches you the <em>why</em> behind your
                                hair &mdash; so you stop wasting money on things
                                that were never going to work, and start
                                building a routine that actually does.
                            </p>

                            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                                <Button
                                    asChild
                                    className='h-12 px-6'>
                                    <Link href='/#shop'>Shop</Link>
                                </Button>
                            </div>
                        </div>
                    </FadeIn>
                </section>

                {/* Details */}
                <section
                    ref={detailRef}
                    className='border-t'>
                    <div className='mx-auto max-w-6xl px-6 py-14 sm:py-20'>
                        <FadeIn
                            inView={detailIn}
                            delayMs={150}>
                            <div className='grid gap-10 md:grid-cols-2 md:items-start'>
                                <div className='space-y-6 bg-background/35 rounded-3xl p-6'>
                                    <h2 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
                                        Why most routines fail
                                    </h2>

                                    <p className='text-lg leading-8'>
                                        It&apos;s not the products. It&apos;s
                                        not your hair type. It&apos;s that
                                        nobody ever explained the mechanics
                                        &mdash; what porosity actually means for
                                        your routine, why breakage and shedding
                                        are completely different problems, or
                                        how to read what your hair is telling
                                        you week to week.
                                    </p>

                                    <p className='text-lg leading-8'>
                                        That&apos;s the gap The Hair Insider
                                        fills. Not more tips &mdash; the actual
                                        understanding behind them, so every
                                        decision you make is an informed one.
                                    </p>

                                    <Separator />

                                    <div className='rounded-2xl bg-muted p-4'>
                                        <p className='text-xs font-medium'>
                                            What changes
                                        </p>
                                        <p className='mt-1 text-sm text-foreground'>
                                            Less trial and error. Less
                                            overwhelm. More &ldquo;ohh, that
                                            makes sense.&rdquo; Then a routine
                                            you can actually maintain.
                                        </p>
                                    </div>
                                </div>

                                <div className='grid gap-4 sm:grid-cols-2'>
                                    {[
                                        {
                                            title: "The why first",
                                            desc: "Understand what's happening before you change anything — so every decision is an informed one, not a guess.",
                                        },
                                        {
                                            title: "Fewer products, better results",
                                            desc: "Intentional routines with fewer moving parts. Consistency becomes easy when you're not managing 12 things.",
                                        },
                                        {
                                            title: "Troubleshoot like a stylist",
                                            desc: "Learn what dryness, breakage, frizz, and shedding actually signal — and what to change first.",
                                        },
                                        {
                                            title: "Built for real life",
                                            desc: "Short lessons and practical guides you can use immediately, without blocking off an entire afternoon.",
                                        },
                                    ].map(item => (
                                        <Card
                                            key={item.title}
                                            className='rounded-2xl'>
                                            <CardHeader>
                                                <CardTitle className='text-sm'>
                                                    {item.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className='text-sm'>
                                                {item.desc}
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
                                    <Link href='/inside-the-course'>
                                        See What&apos;s Inside
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
