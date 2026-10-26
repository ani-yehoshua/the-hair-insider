"use client";

import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Overlay } from "@/components/site/Overlay";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import { FAQ_SECTIONS } from "./faqData";

export default function FaqClient() {
    const { ref: heroRef, inView: heroIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });
    const { ref: contentRef, inView: contentIn } = useInView({
        triggerOnce: true,
        threshold: 0.1,
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
                    className='mx-auto max-w-6xl px-6 pb-14 pt-14'>
                    <FadeIn
                        inView={heroIn}
                        delayMs={100}>
                        <div className='space-y-6 bg-background/50 rounded-3xl p-6 max-w-3xl'>
                            <Badge
                                variant='secondary'
                                className='w-fit'>
                                Questions
                            </Badge>

                            <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
                                FAQ
                            </h1>

                            <p className='text-lg leading-8'>
                                Everything you&apos;re wondering before you
                                decide. If something&apos;s still not answered
                                here,{" "}
                                <a
                                    href='/support'
                                    className='underline underline-offset-4'>
                                    reach out
                                </a>{" "}
                                and we&apos;ll get back to you.
                            </p>
                        </div>
                    </FadeIn>
                </section>

                {/* FAQ content */}
                <section
                    ref={contentRef}
                    className='border-t'>
                    <div className='mx-auto max-w-6xl px-6 py-14'>
                        <FadeIn
                            inView={contentIn}
                            delayMs={100}>
                            <div className='max-w-3xl space-y-12'>
                                {FAQ_SECTIONS.map(section => (
                                    <div key={section.label}>
                                        <p className='text-md text-secondary font-semibold uppercase tracking-wider mb-4'>
                                            {section.label}
                                        </p>
                                        <Separator className='mb-6' />
                                        <Accordion
                                            type='single'
                                            collapsible
                                            className='space-y-1'>
                                            {section.items.map((item, i) => (
                                                <AccordionItem
                                                    key={i}
                                                    value={`${section.label}-${i}`}
                                                    className='border bg-secondary rounded-2xl px-4'>
                                                    <AccordionTrigger className='text-md font-medium text-left py-4'>
                                                        {item.q}
                                                    </AccordionTrigger>
                                                    <AccordionContent className='text-sm leading-relaxed pb-4'>
                                                        {item.a}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </div>
                                ))}
                            </div>
                        </FadeIn>
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    );
}
