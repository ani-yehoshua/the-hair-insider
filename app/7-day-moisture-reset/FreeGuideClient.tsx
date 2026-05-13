"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

const GUIDE_SLUG = "7-day-moisture-reset";

export default function FreeGuideClient() {
    const userRef = useRef<{ id: string } | null>(null);
    const [cloudProgress, setCloudProgress] = useState<Record<
        string,
        boolean
    > | null>(null);
    const [authReady, setAuthReady] = useState(false);

    // Load auth state and any cloud-saved progress before the main effect runs
    useEffect(() => {
        async function init() {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session) {
                userRef.current = { id: session.user.id };
                const { data } = await supabase
                    .from("guide_progress")
                    .select("progress")
                    .eq("user_id", session.user.id)
                    .eq("guide_slug", GUIDE_SLUG)
                    .maybeSingle();
                if (data?.progress) {
                    setCloudProgress(data.progress as Record<string, boolean>);
                }
            }
            setAuthReady(true);
        }
        init();
    }, []);

    useEffect(() => {
        if (!authReady) return;

        // ---------- State persistence ----------
        const STORAGE_KEY = "hairinsider-7day-v1";
        const STORAGE_OPEN = "hairinsider-7day-open-v1";
        const STORAGE_CELEBRATED = "hairinsider-7day-celebrated-v1";

        // Cloud progress wins over localStorage for cross-device sync
        let state: Record<string, boolean> = {};
        if (cloudProgress !== null) {
            state = cloudProgress;
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            } catch {}
        } else {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) state = JSON.parse(raw);
            } catch {
                state = {};
            }
        }

        function saveState() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            } catch {}
            if (userRef.current) {
                supabase
                    .from("guide_progress")
                    .upsert(
                        {
                            user_id: userRef.current.id,
                            guide_slug: GUIDE_SLUG,
                            progress: state,
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: "user_id,guide_slug" },
                    )
                    .then(
                        () => {},
                        () => {},
                    );
            }
        }

        // ---------- Checkboxes ----------
        const allChecks = document.querySelectorAll<HTMLInputElement>(
            '.step input[type="checkbox"]',
        );
        const totalChecks = allChecks.length;
        const progressCountEl = document.getElementById("progressCount");
        if (progressCountEl) progressCountEl.textContent = `0 / ${totalChecks}`;

        function updateStepUI(input: HTMLInputElement) {
            const li = input.closest(".step");
            if (!li) return;
            if (input.checked) li.classList.add("checked");
            else li.classList.remove("checked");
        }

        function updateDayProgress(dayEl: Element) {
            const inputs = dayEl.querySelectorAll<HTMLInputElement>(
                '.step input[type="checkbox"]',
            );
            const total = inputs.length;
            const done = Array.from(inputs).filter(i => i.checked).length;
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);
            const fill = dayEl.querySelector<HTMLElement>(".mini-fill");
            if (fill) fill.style.width = pct + "%";
            const badge = dayEl.querySelector(".check-badge");
            if (pct === 100) {
                dayEl.classList.add("complete");
                if (badge) badge.textContent = "✓";
            } else {
                dayEl.classList.remove("complete");
                if (badge) badge.textContent = "○";
            }
            return { done, total };
        }

        function updateOverallProgress() {
            const done = Array.from(allChecks).filter(i => i.checked).length;
            const pct =
                totalChecks === 0 ? 0 : Math.round((done / totalChecks) * 100);
            const fillEl = document.getElementById(
                "progressFill",
            ) as HTMLElement | null;
            if (fillEl) fillEl.style.width = pct + "%";
            if (progressCountEl)
                progressCountEl.textContent = `${done} / ${totalChecks}`;
            return done;
        }

        // Restore state
        allChecks.forEach(input => {
            const id = (input as HTMLInputElement & { dataset: DOMStringMap })
                .dataset.id;
            if (id && state[id]) input.checked = true;
            updateStepUI(input);
            input.addEventListener("change", () => {
                const inputId = input.dataset.id;
                if (inputId) state[inputId] = input.checked;
                saveState();
                updateStepUI(input);
                const dayEl = input.closest(".day-card");
                if (dayEl) updateDayProgress(dayEl);
                updateOverallProgress();

                // Celebrate if all days are 100% AND haven't celebrated yet
                const allDays = document.querySelectorAll(".day-card");
                const allComplete = Array.from(allDays).every(d =>
                    d.classList.contains("complete"),
                );
                if (allComplete && !localStorage.getItem(STORAGE_CELEBRATED)) {
                    setTimeout(() => {
                        document
                            .getElementById("celebrate")
                            ?.classList.add("show");
                        try {
                            localStorage.setItem(STORAGE_CELEBRATED, "1");
                        } catch {}
                    }, 500);
                }
            });
        });

        // Initial day & overall progress
        document
            .querySelectorAll(".day-card")
            .forEach(d => updateDayProgress(d));
        updateOverallProgress();

        // ---------- Day expand/collapse ----------
        let openDays: string[] = [];
        try {
            const rawOpen = localStorage.getItem(STORAGE_OPEN);
            if (rawOpen) openDays = JSON.parse(rawOpen);
        } catch {}

        document.querySelectorAll(".day-card").forEach(card => {
            const day = (card as HTMLElement).dataset.day;
            if (day && openDays.includes(day)) card.classList.add("open");
            const head = card.querySelector(".day-head");
            head?.addEventListener("click", () => {
                card.classList.toggle("open");
                if (day) {
                    if (card.classList.contains("open")) {
                        if (!openDays.includes(day)) openDays.push(day);
                    } else {
                        openDays = openDays.filter(d => d !== day);
                    }
                }
                try {
                    localStorage.setItem(
                        STORAGE_OPEN,
                        JSON.stringify(openDays),
                    );
                } catch {}
            });
        });

        // Auto-open Day 1 on first visit if nothing is open
        if (openDays.length === 0 && Object.keys(state).length === 0) {
            const day1 = document.querySelector('.day-card[data-day="1"]');
            if (day1) day1.classList.add("open");
        }

        // ---------- Reset progress ----------
        const resetBtn = document.getElementById("resetBtn");
        resetBtn?.addEventListener("click", () => {
            if (!confirm("Reset all your progress for this 7-day reset?"))
                return;
            state = {};
            saveState();
            try {
                localStorage.removeItem(STORAGE_CELEBRATED);
            } catch {}
            allChecks.forEach(i => {
                i.checked = false;
                updateStepUI(i);
            });
            document
                .querySelectorAll(".day-card")
                .forEach(d => updateDayProgress(d));
            updateOverallProgress();
        });

        // ---------- Celebrate close ----------
        document
            .getElementById("celebrateClose")
            ?.addEventListener("click", () => {
                document.getElementById("celebrate")?.classList.remove("show");
            });
        document.getElementById("celebrate")?.addEventListener("click", e => {
            if ((e.target as HTMLElement).id === "celebrate")
                document.getElementById("celebrate")?.classList.remove("show");
        });

        // ---------- Sticky progress show/hide ----------
        const progressBar = document.getElementById("progressBar");
        const heroEl = document.querySelector(".hero");
        function checkProgressVisible() {
            if (!heroEl || !progressBar) return;
            const heroBottom = heroEl.getBoundingClientRect().bottom;
            if (heroBottom < 40) progressBar.classList.add("show");
            else progressBar.classList.remove("show");
        }
        window.addEventListener("scroll", checkProgressVisible, {
            passive: true,
        });
        checkProgressVisible();

        // ---------- Scroll reveal ----------
        const reveal = new IntersectionObserver(
            entries => {
                entries.forEach(en => {
                    if (en.isIntersecting) {
                        en.target.classList.add("in");
                        reveal.unobserve(en.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
        );

        document
            .querySelectorAll(".section, .fade-up, .stagger")
            .forEach(el => reveal.observe(el));

        return () => {
            window.removeEventListener("scroll", checkProgressVisible);
            reveal.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authReady]);

    return (
        <>
            <link
                rel='preconnect'
                href='https://fonts.googleapis.com'
            />
            <link
                rel='preconnect'
                href='https://fonts.gstatic.com'
                crossOrigin='anonymous'
            />
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link
                href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap'
                rel='stylesheet'
            />

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        /* ---------- Reset & base ---------- */
                        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                        html{ scroll-behavior: smooth; -webkit-text-size-adjust: 100%; scrollbar-width: none; }
                        html::-webkit-scrollbar{ display: none; }
                        #guide-root{
                            font-family: 'Cormorant Garamond', Georgia, serif;
                            font-weight: 400;
                            color: #1a1a1a;
                            background: #ebe5d8;
                            line-height: 1.55;
                            font-size: 18px;
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                        }

                        /* ---------- Palette ----------
                            sage:    #b8bca7
                            sage-2:  #a8ad95
                            cream:   #f3eee5
                            paper:   #ebe5d8
                            blue:    #d4dde3
                            ink:     #1a1a1a
                            mute:    #6e6e6e
                        ----------------------------------- */

                        /* ---------- Typography ---------- */
                        #guide-root h1, #guide-root h2, #guide-root h3, #guide-root h4{ font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 500; line-height: 1.1; letter-spacing: -0.01em; }
                        #guide-root h1{ font-size: clamp(2.4rem, 7vw, 4.5rem); font-style: italic; font-weight: 400; }
                        #guide-root h2{ font-size: clamp(2rem, 5.5vw, 3.4rem); font-weight: 500; }
                        #guide-root h3{ font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 600; }
                        #guide-root h4{ font-size: 1.25rem; font-weight: 600; letter-spacing: 0.02em; }
                        #guide-root .italic{ font-style: italic; }
                        #guide-root .eyebrow{
                            font-family: 'Inter', sans-serif;
                            font-size: 0.72rem;
                            letter-spacing: 0.22em;
                            text-transform: uppercase;
                            font-weight: 500;
                            color: #1a1a1a;
                        }
                        #guide-root .eyebrow-mute{ color: #6e6e6e; }
                        #guide-root .script{
                            font-family: 'Cormorant Garamond', Georgia, serif;
                            font-style: italic;
                            font-weight: 400;
                            color: #4a4a4a;
                        }
                        #guide-root p{ margin-bottom: 0.9em; }
                        #guide-root p:last-child{ margin-bottom: 0; }
                        #guide-root small, #guide-root .small{ font-family: 'Inter', sans-serif; font-size: 0.8rem; letter-spacing: 0.02em; }

                        /* ---------- Layout ---------- */
                        #guide-root .page{ max-width: 920px; margin: 0 auto; padding: 0 24px; }
                        #guide-root .section{
                            padding: 80px 0;
                            opacity: 0;
                            transform: translateY(20px);
                            transition: opacity 0.9s ease-out, transform 0.9s ease-out;
                        }
                        #guide-root .section.in{ opacity: 1; transform: none; }
                        #guide-root .section + .section{ border-top: 1px solid rgba(26,26,26,0.08); }

                        #guide-root .bg-paper{ background: #ebe5d8; }
                        #guide-root .bg-cream{ background: #f3eee5; }
                        #guide-root .bg-sage{ background: #b8bca7; }
                        #guide-root .bg-blue{ background: #d4dde3; }

                        /* Page header bar (paper top mark) */
                        #guide-root .pagemark{
                            display: flex; justify-content: space-between; align-items: baseline;
                            padding: 22px 0 18px;
                            border-bottom: 1px solid rgba(26,26,26,0.2);
                            margin-bottom: 40px;
                        }
                        #guide-root .pagemark .label{ font-family: 'Inter', sans-serif; font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase; }
                        #guide-root .pagemark .num{ font-family: 'Cormorant Garamond', serif; font-style: italic; color: #6e6e6e; font-size: 0.95rem; }

                        /* ---------- Sticky progress bar ---------- */
                        #guide-root .progress-wrap{
                            position: sticky; top: 0; z-index: 40;
                            background: rgba(235,229,216,0.92);
                            backdrop-filter: blur(10px);
                            -webkit-backdrop-filter: blur(10px);
                            border-bottom: 1px solid rgba(26,26,26,0.08);
                            transform: translateY(-100%);
                            transition: transform 0.4s ease;
                        }
                        #guide-root .progress-wrap.show{ transform: none; }
                        #guide-root .progress-inner{
                            max-width: 920px; margin: 0 auto;
                            display: flex; align-items: center; gap: 16px;
                            padding: 12px 24px;
                        }
                        #guide-root .progress-label{
                            font-family: 'Inter', sans-serif;
                            font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase;
                            color: #1a1a1a; white-space: nowrap;
                        }
                        #guide-root .progress-track{
                            flex: 1; height: 4px; background: rgba(26,26,26,0.12); border-radius: 4px; overflow: hidden;
                        }
                        #guide-root .progress-fill{
                            height: 100%; width: 0%;
                            background: #1a1a1a;
                            border-radius: 4px;
                            transition: width 0.6s cubic-bezier(.4,0,.2,1);
                        }
                        #guide-root .progress-count{
                            font-family: 'Cormorant Garamond', serif;
                            font-style: italic;
                            font-size: 1rem;
                            color: #1a1a1a;
                            white-space: nowrap;
                            min-width: 60px; text-align: right;
                        }

                        /* ---------- Hero ---------- */
                        #guide-root .hero{
                            background: #b8bca7;
                            padding: 56px 24px 72px;
                            position: relative;
                            overflow: hidden;
                        }
                        #guide-root .hero-inner{ max-width: 920px; margin: 0 auto; }
                        #guide-root .hero-top{
                            display: flex; justify-content: space-between; align-items: baseline;
                            border-bottom: 1px solid rgba(26,26,26,0.5);
                            border-top: 1px solid rgba(26,26,26,0.5);
                            padding: 10px 0;
                            margin-bottom: 56px;
                        }
                        #guide-root .hero-frame{
                            border: 1px solid rgba(26,26,26,0.5);
                            padding: 28px 32px 32px;
                            text-align: center;
                            background: transparent;
                        }
                        #guide-root .hero-frame .script{ font-size: 1.05rem; margin-bottom: 6px; display: block; }
                        #guide-root .hero-frame h1{
                            font-size: clamp(2.5rem, 9vw, 5.5rem);
                            font-style: italic;
                            font-weight: 400;
                            margin: 4px 0 14px;
                            letter-spacing: -0.02em;
                        }
                        #guide-root .hero-frame .sub{
                            font-family: 'Inter', sans-serif;
                            letter-spacing: 0.28em;
                            text-transform: uppercase;
                            font-size: 0.72rem;
                            color: #1a1a1a;
                            display: inline-flex; align-items: center; gap: 14px;
                        }
                        #guide-root .hero-frame .sub::before, #guide-root .hero-frame .sub::after{ content: ''; width: 18px; height: 1px; background: #1a1a1a; }
                        #guide-root .hero-promise{
                            font-family: 'Cormorant Garamond', Georgia, serif;
                            font-style: italic;
                            font-weight: 600;
                            font-size: clamp(1.1rem, 2.6vw, 1.45rem);
                            line-height: 1.4;
                            color: #1a1a1a;
                            margin: 20px auto 0;
                            max-width: 520px;
                        }

                        #guide-root .hero-figure{
                            margin: 48px auto 0;
                            max-width: 560px;
                            padding: 0 4px;
                        }
                        #guide-root .hero-figure-frame{
                            position: relative;
                            padding: 12px;
                            background: transparent;
                        }
                        #guide-root .hero-figure-frame::before{
                            content: '';
                            position: absolute;
                            inset: 4px;
                            border: 1px solid rgba(255,255,255,0.55);
                            pointer-events: none;
                            z-index: 2;
                        }
                        #guide-root .hero-figure img{
                            display: block;
                            width: 100%;
                            height: auto;
                            aspect-ratio: 4 / 5;
                            object-fit: cover;
                            background: #d6d8c8;
                            image-orientation: from-image;
                        }

                        #guide-root .hero-quote{
                            text-align: center;
                            margin-top: 56px;
                            padding: 0 8px;
                        }
                        #guide-root .hero-quote .divider{
                            display: inline-flex; align-items: center; gap: 14px;
                            margin-bottom: 18px;
                            font-family: 'Inter', sans-serif;
                            font-size: 0.7rem; letter-spacing: 0.28em; text-transform: uppercase;
                        }
                        #guide-root .hero-quote .divider::before, #guide-root .hero-quote .divider::after{ content: ''; width: 36px; height: 1px; background: #1a1a1a; }
                        #guide-root .hero-quote blockquote{
                            font-style: italic;
                            font-size: clamp(1.1rem, 2.6vw, 1.45rem);
                            line-height: 1.45;
                            max-width: 640px; margin: 0 auto;
                            color: #1a1a1a;
                        }
                        #guide-root .hero-cta{
                            margin-top: 36px;
                            text-align: center;
                        }
                        #guide-root .btn{
                            display: inline-block;
                            padding: 14px 32px;
                            font-family: 'Inter', sans-serif;
                            font-size: 0.78rem;
                            letter-spacing: 0.22em;
                            text-transform: uppercase;
                            font-weight: 500;
                            border: 1px solid #1a1a1a;
                            color: #1a1a1a;
                            background: transparent;
                            cursor: pointer;
                            text-decoration: none;
                            transition: all 0.25s ease;
                        }
                        #guide-root .btn:hover{ background: #1a1a1a; color: #f3eee5; }
                        #guide-root .btn-filled{ background: #1a1a1a; color: #f3eee5; }
                        #guide-root .btn-filled:hover{ background: transparent; color: #1a1a1a; }

                        /* ---------- Welcome ---------- */
                        #guide-root .welcome-dots{
                            display: flex; gap: 8px; margin-bottom: 28px;
                        }
                        #guide-root .welcome-dots span{
                            width: 5px; height: 5px; border-radius: 50%;
                            background: #1a1a1a;
                        }
                        #guide-root .pull-quote{
                            border-left: 3px solid #1a1a1a;
                            background: #b8bca7;
                            padding: 24px 28px;
                            font-style: italic;
                            font-size: clamp(1.1rem, 2.4vw, 1.35rem);
                            line-height: 1.45;
                            margin: 32px 0 36px;
                        }
                        #guide-root .science-box{
                            background: #b8bca7;
                            padding: 28px 30px;
                            border-top: 2px solid #1a1a1a;
                            margin-top: 32px;
                        }
                        #guide-root .science-box .eyebrow{ margin-bottom: 12px; display: block; }
                        #guide-root .feel-list{ list-style: none; margin-top: 20px; }
                        #guide-root .feel-list li{
                            padding: 8px 0;
                            border-bottom: 1px solid rgba(26,26,26,0.12);
                            font-style: italic;
                            font-size: 1.08rem;
                        }
                        #guide-root .feel-list li:last-child{ border-bottom: none; }
                        #guide-root .feel-list li::before{
                            content: '—';
                            color: #6e6e6e;
                            margin-right: 10px;
                        }

                        #guide-root .sign-card{
                            margin-top: 40px;
                            background: #b8bca7;
                            border: 1px solid #1a1a1a;
                            padding: 22px 28px;
                            display: inline-block;
                            text-align: center;
                            border-top-width: 2px;
                        }
                        #guide-root .sign-card .script{ font-size: 1rem; }
                        #guide-root .sign-card .name{
                            font-family: 'Cormorant Garamond', serif;
                            font-style: italic;
                            font-size: 2.2rem;
                            font-weight: 400;
                            margin: 6px 0;
                        }
                        #guide-root .sign-card .role{
                            font-family: 'Inter', sans-serif;
                            font-size: 0.65rem;
                            letter-spacing: 0.22em;
                            text-transform: uppercase;
                            color: #1a1a1a;
                        }

                        /* ---------- Core rules grid ---------- */
                        #guide-root .rules-grid{
                            display: grid;
                            grid-template-columns: 1fr;
                            gap: 16px;
                            margin-top: 36px;
                        }
                        @media (min-width: 700px) {
                            #guide-root .rules-grid{ grid-template-columns: 1fr 1fr; }
                            #guide-root .rules-grid .rule-5{ grid-column: 1 / -1; }
                        }
                        #guide-root .rule{
                            background: #b8bca7;
                            padding: 28px 26px;
                            transition: transform 0.4s ease, box-shadow 0.4s ease;
                            position: relative;
                        }
                        #guide-root .rule:hover{ transform: translateY(-3px); box-shadow: 0 14px 30px -18px rgba(0,0,0,0.3); }
                        #guide-root .rule .num{
                            font-family: 'Cormorant Garamond', serif;
                            font-style: italic;
                            font-size: 2.4rem;
                            line-height: 1;
                            font-weight: 500;
                            display: block;
                            margin-bottom: 16px;
                        }
                        #guide-root .rule h4{
                            font-family: 'Inter', sans-serif;
                            font-size: 0.78rem;
                            letter-spacing: 0.22em;
                            text-transform: uppercase;
                            font-weight: 600;
                            margin-bottom: 10px;
                        }
                        #guide-root .rule p{ font-size: 1.02rem; line-height: 1.5; }
                        #guide-root .rules-foot{
                            display: grid;
                            grid-template-columns: 1fr;
                            gap: 16px;
                            margin-top: 28px;
                        }
                        @media (min-width: 700px) {
                            #guide-root .rules-foot{ grid-template-columns: 1fr 1fr; }
                        }
                        #guide-root .rules-foot .col{
                            border-top: 2px solid #1a1a1a;
                            padding-top: 16px;
                        }
                        #guide-root .rules-foot .col h4{
                            font-family: 'Inter', sans-serif;
                            font-size: 0.72rem;
                            letter-spacing: 0.22em;
                            text-transform: uppercase;
                            font-weight: 600;
                            margin-bottom: 14px;
                        }
                        #guide-root .rules-foot ol{
                            list-style: none;
                            counter-reset: step;
                        }
                        #guide-root .rules-foot ol li{
                            counter-increment: step;
                            display: flex; gap: 12px;
                            padding: 6px 0;
                            font-size: 1rem;
                        }
                        #guide-root .rules-foot ol li::before{
                            content: counter(step);
                            font-family: 'Cormorant Garamond', serif;
                            font-style: italic;
                            color: #6e6e6e;
                            flex-shrink: 0;
                        }

                        /* ---------- Days ---------- */
                        #guide-root .days-intro{
                            text-align: center;
                            max-width: 560px;
                            margin: 0 auto 40px;
                        }
                        #guide-root .days-intro h2 .num-display{
                            color: rgba(26,26,26,0.18);
                            font-style: italic;
                        }
                        #guide-root .day-card{
                            background: #b8bca7;
                            margin-bottom: 18px;
                            border-left: 3px solid #1a1a1a;
                            overflow: hidden;
                            transition: all 0.5s ease;
                        }
                        #guide-root .day-card.complete{
                            background: #a8ad95;
                        }
                        #guide-root .day-head{
                            width: 100%;
                            display: flex; align-items: center; gap: 16px;
                            padding: 22px 26px;
                            background: transparent;
                            border: none;
                            cursor: pointer;
                            text-align: left;
                            font-family: inherit;
                            color: inherit;
                            transition: background 0.2s ease;
                        }
                        #guide-root .day-head:hover{ background: rgba(255,255,255,0.08); }
                        #guide-root .day-num{
                            font-family: 'Cormorant Garamond', serif;
                            font-style: italic;
                            font-size: 2.4rem;
                            line-height: 1;
                            font-weight: 500;
                            flex-shrink: 0;
                            width: 50px;
                        }
                        #guide-root .day-title{
                            flex: 1;
                        }
                        #guide-root .day-title .eyebrow{ font-size: 0.7rem; color: #4a4a4a; }
                        #guide-root .day-title h3{
                            font-family: 'Inter', sans-serif;
                            font-size: 1.05rem;
                            letter-spacing: 0.18em;
                            text-transform: uppercase;
                            font-weight: 600;
                            margin-top: 2px;
                        }
                        #guide-root .day-meta{
                            display: flex; align-items: center; gap: 12px;
                            font-family: 'Inter', sans-serif;
                            font-size: 0.72rem;
                            letter-spacing: 0.14em;
                            text-transform: uppercase;
                            color: #1a1a1a;
                        }
                        #guide-root .mini-track{
                            width: 60px; height: 3px;
                            background: rgba(26,26,26,0.18);
                            border-radius: 3px; overflow: hidden;
                            display: none;
                        }
                        @media (min-width: 540px) { .mini-track { display: block; } }
                        #guide-root .mini-fill{
                            height: 100%; width: 0%;
                            background: #1a1a1a;
                            transition: width 0.6s cubic-bezier(.4,0,.2,1);
                        }
                        #guide-root .day-card.complete .mini-fill{ background: #1a1a1a; }
                        #guide-root .check-badge{
                            width: 28px; height: 28px;
                            border: 1px solid #1a1a1a;
                            border-radius: 50%;
                            display: flex; align-items: center; justify-content: center;
                            transition: all 0.3s ease;
                            flex-shrink: 0;
                            font-size: 0.9rem;
                        }
                        #guide-root .day-card.complete .check-badge{
                            background: #1a1a1a; color: #f3eee5;
                        }
                        #guide-root .chev{
                            flex-shrink: 0; width: 14px; height: 14px;
                            border-right: 1.5px solid #1a1a1a;
                            border-bottom: 1.5px solid #1a1a1a;
                            transform: rotate(45deg);
                            transition: transform 0.3s ease;
                            margin-bottom: 4px;
                        }
                        #guide-root .day-card.open .chev{ transform: rotate(-135deg); margin-top: 4px; margin-bottom: 0; }

                        #guide-root .day-body{
                            max-height: 0;
                            overflow: hidden;
                            transition: max-height 0.5s ease;
                        }
                        #guide-root .day-card.open .day-body{ max-height: 2000px; }
                        #guide-root .day-body-inner{
                            padding: 4px 26px 28px;
                        }
                        #guide-root .steps{ list-style: none; }
                        #guide-root .step{
                            display: flex; align-items: flex-start; gap: 14px;
                            padding: 12px 0;
                            border-bottom: 1px solid rgba(26,26,26,0.1);
                            cursor: pointer;
                            transition: opacity 0.3s ease;
                            font-size: 1.04rem;
                            line-height: 1.5;
                        }
                        #guide-root .step:last-child{ border-bottom: none; }
                        #guide-root .step input[type="checkbox"]{
                            appearance: none;
                            -webkit-appearance: none;
                            width: 22px; height: 22px;
                            border: 1.5px solid #1a1a1a;
                            background: transparent;
                            cursor: pointer;
                            flex-shrink: 0;
                            margin-top: 2px;
                            position: relative;
                            transition: all 0.25s ease;
                            border-radius: 2px;
                        }
                        #guide-root .step input[type="checkbox"]:hover{ background: rgba(26,26,26,0.05); }
                        #guide-root .step input[type="checkbox"]:checked{
                            background: #1a1a1a;
                        }
                        #guide-root .step input[type="checkbox"]:checked::after{
                            content: '';
                            position: absolute;
                            left: 6px; top: 2px;
                            width: 6px; height: 11px;
                            border-right: 2px solid #f3eee5;
                            border-bottom: 2px solid #f3eee5;
                            transform: rotate(45deg);
                        }
                        #guide-root .step.checked{
                            opacity: 0.45;
                        }
                        #guide-root .step.checked .step-text{ text-decoration: line-through; text-decoration-color: rgba(26,26,26,0.3); }
                        #guide-root .step .step-text{ flex: 1; }

                        #guide-root .day-tip{
                            background: rgba(255,255,255,0.18);
                            padding: 16px 20px;
                            margin-top: 18px;
                            font-style: italic;
                            font-size: 0.98rem;
                            color: #2a2a2a;
                            border-left: 2px solid #1a1a1a;
                        }
                        #guide-root .day-tip strong{
                            font-family: 'Inter', sans-serif;
                            font-style: normal;
                            font-size: 0.7rem;
                            letter-spacing: 0.2em;
                            text-transform: uppercase;
                            display: block;
                            margin-bottom: 6px;
                        }

                        #guide-root .branch-row{
                            display: grid;
                            grid-template-columns: 1fr;
                            gap: 14px;
                            margin-top: 18px;
                        }
                        @media (min-width: 600px) {
                            #guide-root .branch-row{ grid-template-columns: 1fr 1fr; }
                        }
                        #guide-root .branch{
                            border-top: 2px solid #1a1a1a;
                            padding-top: 14px;
                        }
                        #guide-root .branch h5{
                            font-family: 'Inter', sans-serif;
                            font-size: 0.72rem;
                            letter-spacing: 0.2em;
                            text-transform: uppercase;
                            font-weight: 600;
                            margin-bottom: 8px;
                        }
                        #guide-root .branch p{ font-size: 0.98rem; line-height: 1.5; }

                        /* ---------- Checkpoint ---------- */
                        #guide-root .checks{ display: grid; gap: 14px; margin-top: 32px; }
                        #guide-root .check{
                            background: #b8bca7;
                            border-left: 3px solid #1a1a1a;
                            padding: 22px 26px;
                        }
                        #guide-root .check h4{
                            font-family: 'Inter', sans-serif;
                            font-size: 0.78rem;
                            letter-spacing: 0.2em;
                            text-transform: uppercase;
                            font-weight: 600;
                            margin-bottom: 10px;
                        }
                        #guide-root .check p{ font-size: 1rem; line-height: 1.55; }

                        #guide-root .check-quote{
                            background: #b8bca7;
                            border-left: 3px solid #1a1a1a;
                            padding: 28px 30px;
                            margin-top: 24px;
                            font-style: italic;
                            font-size: clamp(1.15rem, 2.6vw, 1.4rem);
                            line-height: 1.45;
                        }
                        #guide-root .check-foot{
                            margin-top: 18px;
                            font-family: 'Inter', sans-serif;
                            font-size: 0.7rem;
                            letter-spacing: 0.18em;
                            text-transform: uppercase;
                            color: #4a4a4a;
                            line-height: 1.7;
                        }

                        /* ---------- Product Map / Troubleshoot ---------- */
                        #guide-root .twocol{
                            display: grid;
                            grid-template-columns: 1fr;
                            gap: 56px;
                        }
                        @media (min-width: 760px) {
                            #guide-root .twocol{ grid-template-columns: 1fr 1fr; gap: 64px; }
                        }
                        #guide-root .twocol h2{ margin-bottom: 8px; }
                        #guide-root .twocol .lead{
                            font-style: italic;
                            color: #4a4a4a;
                            margin: 16px 0 24px;
                            font-size: 1.05rem;
                        }
                        #guide-root .product-row{
                            display: grid;
                            grid-template-columns: 110px 1fr;
                            gap: 16px;
                            padding: 16px 0;
                            border-top: 1px solid rgba(26,26,26,0.18);
                        }
                        #guide-root .product-row:last-child{ border-bottom: 1px solid rgba(26,26,26,0.18); }
                        #guide-root .product-row .label{
                            font-family: 'Inter', sans-serif;
                            font-size: 0.72rem;
                            letter-spacing: 0.2em;
                            text-transform: uppercase;
                            font-weight: 600;
                        }
                        #guide-root .product-row .desc{ font-size: 1rem; line-height: 1.5; }

                        #guide-root .trouble{
                            padding: 16px 0;
                            border-top: 1px solid rgba(26,26,26,0.18);
                        }
                        #guide-root .trouble:last-child{ border-bottom: 1px solid rgba(26,26,26,0.18); }
                        #guide-root .trouble h4{
                            font-family: 'Inter', sans-serif;
                            font-size: 0.78rem;
                            letter-spacing: 0.2em;
                            text-transform: uppercase;
                            font-weight: 600;
                            margin-bottom: 6px;
                        }
                        #guide-root .trouble p{ font-size: 1rem; line-height: 1.5; }

                        /* ---------- Timeline & upsell ---------- */
                        #guide-root .upsell-section{ background: #d4dde3; padding: 80px 0; }
                        #guide-root .upsell-grid{
                            display: grid;
                            grid-template-columns: 1fr;
                            gap: 56px;
                        }
                        @media (min-width: 760px) {
                            #guide-root .upsell-grid{ grid-template-columns: 1fr 1fr; gap: 64px; }
                        }
                        #guide-root .timeline{ position: relative; padding-left: 8px; margin-top: 32px; }
                        #guide-root .timeline::before{
                            content: '';
                            position: absolute;
                            left: 22px; top: 28px; bottom: 28px;
                            width: 1px;
                            background: rgba(26,26,26,0.25);
                        }
                        #guide-root .tl-step{
                            display: grid;
                            grid-template-columns: 44px 1fr;
                            gap: 18px;
                            margin-bottom: 26px;
                            align-items: start;
                        }
                        #guide-root .tl-dot{
                            width: 44px; height: 44px;
                            background: #f3eee5;
                            border: 1px solid #1a1a1a;
                            display: flex; align-items: center; justify-content: center;
                            font-family: 'Cormorant Garamond', serif;
                            font-style: italic;
                            font-size: 0.95rem;
                            z-index: 2; position: relative;
                        }
                        #guide-root .tl-body h4{
                            font-family: 'Inter', sans-serif;
                            font-size: 0.72rem;
                            letter-spacing: 0.2em;
                            text-transform: uppercase;
                            font-weight: 600;
                            margin-bottom: 6px;
                        }
                        #guide-root .tl-body p{ font-size: 1rem; line-height: 1.55; }

                        #guide-root .offer-card{
                            background: #f3eee5;
                            padding: 36px 32px;
                            margin-top: 24px;
                            border: 1px solid rgba(26,26,26,0.1);
                            box-shadow: 0 30px 60px -40px rgba(0,0,0,0.25);
                        }
                        #guide-root .offer-card h3{
                            font-size: 2rem;
                            margin-bottom: 8px;
                        }
                        #guide-root .offer-card .lead{ font-style: italic; color: #4a4a4a; margin: 8px 0 22px; }
                        #guide-root .offer-list{ list-style: none; margin-bottom: 28px; }
                        #guide-root .offer-list li{
                            padding: 8px 0;
                            display: flex; gap: 14px; align-items: start;
                            font-size: 1.02rem; line-height: 1.5;
                        }
                        #guide-root .offer-list li::before{
                            content: '✓';
                            font-family: 'Inter', sans-serif;
                            color: #1a1a1a;
                            font-weight: 600;
                            flex-shrink: 0;
                            margin-top: 2px;
                        }
                        #guide-root .price{
                            font-family: 'Cormorant Garamond', serif;
                            font-size: 3.4rem;
                            font-weight: 500;
                            line-height: 1;
                            margin-bottom: 6px;
                            display: block;
                        }
                        #guide-root .price-meta{
                            font-style: italic;
                            color: #4a4a4a;
                            font-size: 0.95rem;
                            margin-bottom: 24px;
                        }
                        #guide-root .bonus-card{
                            background: #d4dde3;
                            border-left: 3px solid #1a1a1a;
                            padding: 18px 22px;
                            margin-top: 22px;
                        }
                        #guide-root .bonus-card h5{
                            font-family: 'Inter', sans-serif;
                            font-size: 0.72rem;
                            letter-spacing: 0.2em;
                            text-transform: uppercase;
                            font-weight: 600;
                            margin-bottom: 6px;
                        }
                        #guide-root .bonus-card p{ font-size: 0.98rem; }

                        /* ---------- Footer ---------- */
                        #guide-root footer{
                            background: #1a1a1a;
                            color: #ebe5d8;
                            padding: 40px 24px;
                            text-align: center;
                        }
                        #guide-root footer .brand{
                            font-family: 'Inter', sans-serif;
                            font-size: 0.72rem;
                            letter-spacing: 0.28em;
                            text-transform: uppercase;
                            margin-bottom: 12px;
                        }
                        #guide-root footer .tag{
                            font-style: italic;
                            font-size: 1rem;
                            color: rgba(235,229,216,0.7);
                        }

                        /* ---------- Celebration overlay ---------- */
                        #guide-root .celebrate{
                            position: fixed; inset: 0;
                            background: rgba(26,26,26,0.8);
                            display: flex; align-items: center; justify-content: center;
                            z-index: 100;
                            opacity: 0; pointer-events: none;
                            transition: opacity 0.5s ease;
                            padding: 24px;
                        }
                        #guide-root .celebrate.show{ opacity: 1; pointer-events: auto; }
                        #guide-root .celebrate-card{
                            background: #ebe5d8;
                            padding: 48px 36px;
                            max-width: 460px;
                            text-align: center;
                            transform: scale(0.92);
                            transition: transform 0.6s cubic-bezier(.2,.9,.3,1.2);
                        }
                        #guide-root .celebrate.show .celebrate-card{ transform: scale(1); }
                        #guide-root .celebrate-card .script{ font-size: 1rem; }
                        #guide-root .celebrate-card h3{
                            font-size: 2.4rem;
                            font-style: italic;
                            font-weight: 400;
                            margin: 8px 0 16px;
                        }
                        #guide-root .celebrate-card p{ margin-bottom: 22px; font-size: 1.08rem; }
                        #guide-root .celebrate-close{
                            font-family: 'Inter', sans-serif;
                            font-size: 0.7rem;
                            letter-spacing: 0.22em;
                            text-transform: uppercase;
                            background: none; border: none;
                            cursor: pointer;
                            margin-top: 14px;
                            color: #6e6e6e;
                        }

                        /* ---------- Subtle entry animation utility ---------- */
                        #guide-root .fade-up{ opacity: 0; transform: translateY(16px); transition: opacity 0.8s ease, transform 0.8s ease; }
                        #guide-root .fade-up.in{ opacity: 1; transform: none; }
                        #guide-root .stagger > *{ opacity: 0; transform: translateY(12px); transition: opacity 0.7s ease, transform 0.7s ease; }
                        #guide-root .stagger.in > *{ opacity: 1; transform: none; }
                        #guide-root .stagger.in > *:nth-child(1){ transition-delay: 0.05s; }
                        #guide-root .stagger.in > *:nth-child(2){ transition-delay: 0.12s; }
                        #guide-root .stagger.in > *:nth-child(3){ transition-delay: 0.19s; }
                        #guide-root .stagger.in > *:nth-child(4){ transition-delay: 0.26s; }
                        #guide-root .stagger.in > *:nth-child(5){ transition-delay: 0.33s; }
                        #guide-root .stagger.in > *:nth-child(6){ transition-delay: 0.40s; }

                        /* Reset button (small) */
                        #guide-root .reset-btn{
                            background: none; border: none;
                            font-family: 'Inter', sans-serif;
                            font-size: 0.65rem;
                            letter-spacing: 0.22em;
                            text-transform: uppercase;
                            color: #6e6e6e;
                            cursor: pointer;
                            text-decoration: underline;
                            text-underline-offset: 4px;
                            padding: 0;
                        }
                        #guide-root .reset-btn:hover{ color: #1a1a1a; }

                        @media (max-width: 540px) {
                            #guide-root .section{ padding: 56px 0; }
                            #guide-root .hero{ padding: 36px 20px 56px; }
                            #guide-root .hero-frame{ padding: 22px 18px 24px; }
                            #guide-root .hero-quote{ margin-top: 36px; }
                            #guide-root .pull-quote{ padding: 20px 22px; }
                            #guide-root .science-box{ padding: 22px; }
                            #guide-root .day-head{ padding: 18px 18px; gap: 12px; }
                            #guide-root .day-body-inner{ padding: 4px 18px 22px; }
                            #guide-root .day-num{ font-size: 2rem; width: 38px; }
                            #guide-root .offer-card{ padding: 28px 22px; }
                            #guide-root .pagemark{ margin-bottom: 28px; }
                        }
                    `,
                }}
            />

            <div id='guide-root'>
                {/* ============ STICKY PROGRESS ============ */}
                <div
                    className='progress-wrap'
                    id='progressBar'>
                    <div className='progress-inner'>
                        <div className='progress-label'>Your Reset</div>
                        <div className='progress-track'>
                            <div
                                className='progress-fill'
                                id='progressFill'></div>
                        </div>
                        <div
                            className='progress-count'
                            id='progressCount'>
                            0 / 32
                        </div>
                    </div>
                </div>

                {/* ============ HERO ============ */}
                <header className='hero section in'>
                    <div className='hero-inner'>
                        <div className='hero-top'>
                            <span className='eyebrow'>The Hair Insider</span>
                            <nav
                                style={{
                                    display: "flex",
                                    gap: "20px",
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: "0.68rem",
                                    letterSpacing: "0.16em",
                                    textTransform: "uppercase",
                                    alignItems: "center",
                                }}>
                                <Link
                                    href='/'
                                    style={{
                                        color: "#1a1a1a",
                                        textDecoration: "none",
                                    }}>
                                    Home
                                </Link>
                                <Link
                                    href='/account'
                                    style={{
                                        color: "#1a1a1a",
                                        textDecoration: "none",
                                    }}>
                                    Account
                                </Link>
                            </nav>
                        </div>

                        <div className='hero-frame'>
                            <span className='script'>
                                a stylist-designed routine
                            </span>
                            <h1>7-Day Moisture Reset</h1>
                            <span className='sub'>
                                Stop breakage &amp; keep length
                            </span>
                            <p className='hero-promise'>
                                Stop breakage, keep length, feel softer ends in
                                7 days.
                            </p>
                        </div>

                        <figure className='hero-figure'>
                            <div className='hero-figure-frame'>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src='/braided_pony_double_bow.jpeg'
                                    alt='Fishtail braid finished with sheer ribbons — The Hair Insider'
                                />
                            </div>
                        </figure>

                        <div className='hero-quote'>
                            <span className='divider'>A Reminder</span>
                            <blockquote>
                                &ldquo;Stop breakage, keep length, feel softer
                                ends in 7 days.&rdquo;
                            </blockquote>
                            <div className='hero-cta'>
                                <a
                                    href='#welcome'
                                    className='btn btn-filled'>
                                    Begin the reset
                                </a>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ============ WELCOME ============ */}
                <section
                    className='section bg-cream'
                    id='welcome'>
                    <div className='page'>
                        <div className='pagemark'>
                            <span className='label'>The Hair Insider</span>
                            <span className='num'>02</span>
                        </div>

                        <div className='welcome-dots stagger'>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span className='script'>A note from your stylist</span>
                        <h1 style={{ marginTop: "6px" }}>Welcome, friend!</h1>

                        <div className='pull-quote'>
                            &ldquo;Your hair isn&rsquo;t refusing to grow.
                            It&rsquo;s just losing length faster than it gains
                            it.&rdquo;
                        </div>

                        <p>
                            Here&rsquo;s the truth nobody tells you: your hair{" "}
                            <em>is</em> growing. About a half inch every month,
                            like clockwork. The problem isn&rsquo;t the root
                            &mdash; it&rsquo;s the ends. When moisture
                            isn&rsquo;t sticking, hair loses elasticity. Brittle
                            hair snaps. Snapped hair never makes it past your
                            shoulders.
                        </p>

                        <p>
                            This week is a reset. Seven days of small,
                            intentional shifts that add up to something real
                            &mdash; softer ends, less friction, styles that
                            hold. The signal isn&rsquo;t what you see in the
                            mirror. It&rsquo;s what your <em>hands</em> feel.
                        </p>

                        <div className='science-box'>
                            <span className='eyebrow'>
                                The Science Behind It
                            </span>
                            <p>
                                Think of each hair strand like a pine cone
                                &mdash; tiny overlapping layers that lie flat
                                when healthy, and lift when damaged. When the
                                outer layer lays flat, moisture stays in and
                                hair looks shiny. When it&rsquo;s lifted from
                                heat damage, color, or rough handling, moisture
                                escapes &mdash; and hair feels brittle and
                                snaps. This week we&rsquo;ll get that outer
                                layer back to lying flat so your hair can hold
                                onto hydration. Less breakage means the length
                                you grow actually stays.
                            </p>
                            <p
                                style={{
                                    marginTop: "14px",
                                    fontStyle: "italic",
                                }}>
                                If this week feels different by Day 7, extend it
                                with the full 21-day rhythm inside{" "}
                                <em>How To Grow Your Hair</em>.
                            </p>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr",
                                gap: "32px",
                                marginTop: "40px",
                                alignItems: "start",
                            }}
                            className='welcome-foot'>
                            <div>
                                <div
                                    style={{
                                        borderTop: "2px solid #1a1a1a",
                                        paddingTop: "14px",
                                    }}>
                                    <h4
                                        style={{
                                            fontFamily: "'Inter',sans-serif",
                                            fontSize: "0.72rem",
                                            letterSpacing: "0.22em",
                                            textTransform: "uppercase",
                                            fontWeight: 600,
                                            marginBottom: "14px",
                                        }}>
                                        What you may feel by Day 7
                                    </h4>
                                    <ul className='feel-list'>
                                        <li>
                                            Ends feel soft and pliable instead
                                            of rough or brittle
                                        </li>
                                        <li>
                                            Less friction when running fingers
                                            through detangled hair
                                        </li>
                                        <li>
                                            Styles hold shape with less product
                                            than before
                                        </li>
                                        <li>
                                            Detangling takes less force and less
                                            time
                                        </li>
                                        <li>
                                            Scalp feels balanced &mdash; not
                                            itchy, not heavy
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div style={{ textAlign: "right" }}>
                                <div className='sign-card'>
                                    <span className='script'>With care,</span>
                                    <div className='name'>Lauren</div>
                                    <div className='role'>Your stylist</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============ CORE RULES ============ */}
                <section className='section bg-paper'>
                    <div className='page'>
                        <div className='pagemark'>
                            <span className='label'>The Hair Insider</span>
                            <span className='num'>03</span>
                        </div>

                        <span className='script'>Before you begin</span>
                        <h1 style={{ marginTop: "6px" }}>Core Routine Rules</h1>

                        <div className='rules-grid stagger'>
                            <div className='rule'>
                                <span className='num'>01</span>
                                <h4>Use slip before any detangling</h4>
                                <p>
                                    Whether you detangle before washing (with
                                    oil on dry hair) or during conditioning,
                                    always ensure the strand is coated with slip
                                    first. Work section by section from ends to
                                    roots. The slip protects from friction
                                    &mdash; not the moisture alone.
                                </p>
                            </div>
                            <div className='rule'>
                                <span className='num'>02</span>
                                <h4>Layer in the right order</h4>
                                <p>
                                    Wash day: cleanse &rarr; deep condition
                                    (rinse out) &rarr; leave-in on damp hair
                                    &rarr; cream if needed &rarr; light oil on
                                    ends &rarr; heat protectant.
                                </p>
                            </div>
                            <div className='rule'>
                                <span className='num'>03</span>
                                <h4>Keep tension low</h4>
                                <p>
                                    Traction from tight styles causes mechanical
                                    breakage at the follicle and shaft over
                                    time. Keep edges and lengths under low
                                    tension all week &mdash; especially on
                                    refresh days when hair is handled more.
                                </p>
                            </div>
                            <div className='rule'>
                                <span className='num'>04</span>
                                <h4>Protect nightly</h4>
                                <p>
                                    Cotton pillowcases tug on hair all night and
                                    soak up your natural oils. A silk or satin
                                    pillowcase (or bonnet) protects your
                                    blowout, prevents tangles, and is the
                                    easiest swap with the biggest payoff. All
                                    seven nights &mdash; no exceptions.
                                </p>
                            </div>
                            <div className='rule rule-5'>
                                <span className='num'>05</span>
                                <h4>Minimal manipulation all week</h4>
                                <p>
                                    Every time hands touch hair, there&rsquo;s
                                    mechanical stress on the strand. Style once,
                                    refresh lightly, and leave it alone. The
                                    less contact your ends have with fingers and
                                    tension this week &mdash; the better the
                                    result at Day 7.
                                </p>
                            </div>
                        </div>

                        <div className='rules-foot'>
                            <div className='col'>
                                <h4>Wash day order (after shampoo)</h4>
                                <ol>
                                    <li>Rinse-out conditioner with slip</li>
                                    <li>Leave-in applied to damp hair</li>
                                    <li>Cream if hair still feels rough</li>
                                </ol>
                            </div>
                            <div className='col'>
                                <h4>Between-wash days</h4>
                                <ol>
                                    <li>
                                        Brush gently from ends up &mdash; never
                                        roots down
                                    </li>
                                    <li>
                                        Apply a leave-in mask to mid-lengths and
                                        ends &mdash; a few drops is enough
                                    </li>
                                    <li>
                                        Add heat protectant before any heat
                                        styling
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============ DAYS 1-7 ============ */}
                <section
                    className='section bg-cream'
                    id='days'>
                    <div className='page'>
                        <div className='pagemark'>
                            <span className='label'>
                                The Hair Insider · Your 7 days
                            </span>
                            <span className='num'>04 — 06</span>
                        </div>

                        <div className='days-intro'>
                            <span className='script'>The reset begins</span>
                            <h2>
                                Days <span className='num-display'>1 — 7</span>
                            </h2>
                            <p
                                style={{
                                    marginTop: "18px",
                                    color: "#4a4a4a",
                                    fontStyle: "italic",
                                }}>
                                Tap any day to expand it. Check off each step as
                                you finish &mdash; your progress saves
                                automatically.
                            </p>
                            <div style={{ marginTop: "14px" }}>
                                <button
                                    className='reset-btn'
                                    id='resetBtn'>
                                    Reset my progress
                                </button>
                            </div>
                        </div>

                        <div
                            className='days-list'
                            id='daysList'>
                            {/* DAY 1 */}
                            <article
                                className='day-card'
                                data-day='1'>
                                <button
                                    className='day-head'
                                    type='button'>
                                    <span className='day-num'>01</span>
                                    <div className='day-title'>
                                        <span className='eyebrow eyebrow-mute'>
                                            Day 1
                                        </span>
                                        <h3>Wash Day</h3>
                                    </div>
                                    <div className='day-meta'>
                                        <div className='mini-track'>
                                            <div className='mini-fill'></div>
                                        </div>
                                        <span className='check-badge'>○</span>
                                        <span className='chev'></span>
                                    </div>
                                </button>
                                <div className='day-body'>
                                    <div className='day-body-inner'>
                                        <ul className='steps'>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d1-1'
                                                />
                                                <span className='step-text'>
                                                    Wash twice with shampoo if
                                                    you went more than 3 days
                                                    between washes &mdash; one
                                                    pass cleans the scalp, the
                                                    second clears product
                                                    buildup
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d1-2'
                                                />
                                                <span className='step-text'>
                                                    Apply a hydrating mask or
                                                    deep conditioner from
                                                    mid-length to ends. Shower
                                                    cap on for 10&ndash;15
                                                    minutes &mdash; your body
                                                    heat helps it sink in
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d1-3'
                                                />
                                                <span className='step-text'>
                                                    Rinse with cool water
                                                    &mdash; cool water helps the
                                                    outer layer of the strand
                                                    lay flat and reflect more
                                                    shine
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d1-4'
                                                />
                                                <span className='step-text'>
                                                    Towel dry gently with a
                                                    microfiber towel or cotton
                                                    t-shirt. No rough rubbing
                                                    &mdash; wet hair is fragile
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d1-5'
                                                />
                                                <span className='step-text'>
                                                    Apply heat protectant before
                                                    any blow dryer or hot tool
                                                    &mdash; non-negotiable
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d1-6'
                                                />
                                                <span className='step-text'>
                                                    Smooth a pea-size leave-in
                                                    cream through mid-lengths to
                                                    ends
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d1-7'
                                                />
                                                <span className='step-text'>
                                                    Blow dry with the nozzle
                                                    pointed down the hair shaft
                                                    (root to tip). One drop of
                                                    oil on ends to finish
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </article>

                            {/* DAY 2 */}
                            <article
                                className='day-card'
                                data-day='2'>
                                <button
                                    className='day-head'
                                    type='button'>
                                    <span className='day-num'>02</span>
                                    <div className='day-title'>
                                        <span className='eyebrow eyebrow-mute'>
                                            Day 2
                                        </span>
                                        <h3>Sleep + Refresh</h3>
                                    </div>
                                    <div className='day-meta'>
                                        <div className='mini-track'>
                                            <div className='mini-fill'></div>
                                        </div>
                                        <span className='check-badge'>○</span>
                                        <span className='chev'></span>
                                    </div>
                                </button>
                                <div className='day-body'>
                                    <div className='day-body-inner'>
                                        <ul className='steps'>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d2-1'
                                                />
                                                <span className='step-text'>
                                                    Gently detangle with a boar
                                                    bristle or wet brush before
                                                    bed &mdash; soft flexible
                                                    bristles protect fragile
                                                    strands without causing
                                                    breakage
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d2-2'
                                                />
                                                <span className='step-text'>
                                                    Apply a small amount of
                                                    water-based leave-in mask to
                                                    mid-lengths and ends &mdash;
                                                    keeps strands hydrated
                                                    without weighing them down
                                                    by morning
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d2-3'
                                                />
                                                <span className='step-text'>
                                                    Loosely braid or twist and
                                                    secure with a silk scrunchie
                                                    &mdash; regular elastics
                                                    create tension points that
                                                    snap fine strands overnight
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d2-4'
                                                />
                                                <span className='step-text'>
                                                    Sleep on satin or silk, or
                                                    wrap in a satin scarf
                                                    &mdash; cotton creates
                                                    friction that breaks strands
                                                    and causes frizz
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </article>

                            {/* DAY 3 */}
                            <article
                                className='day-card'
                                data-day='3'>
                                <button
                                    className='day-head'
                                    type='button'>
                                    <span className='day-num'>03</span>
                                    <div className='day-title'>
                                        <span className='eyebrow eyebrow-mute'>
                                            Day 3
                                        </span>
                                        <h3>Scalp Care</h3>
                                    </div>
                                    <div className='day-meta'>
                                        <div className='mini-track'>
                                            <div className='mini-fill'></div>
                                        </div>
                                        <span className='check-badge'>○</span>
                                        <span className='chev'></span>
                                    </div>
                                </button>
                                <div className='day-body'>
                                    <div className='day-body-inner'>
                                        <ul className='steps'>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d3-1'
                                                />
                                                <span className='step-text'>
                                                    3&ndash;5 minute scalp
                                                    massage using your
                                                    fingertips (not your nails)
                                                    &mdash; boosts blood flow to
                                                    your roots and spreads
                                                    natural oils down the strand
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d3-2'
                                                />
                                                <span className='step-text'>
                                                    If your scalp feels dry, use
                                                    a few drops of light scalp
                                                    oil (rosemary, jojoba,
                                                    argan) before massaging.
                                                    Skip heavy butters or
                                                    coconut oil at the roots
                                                    &mdash; they clog follicles
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d3-3'
                                                />
                                                <span className='step-text'>
                                                    Brush hair from ends to
                                                    roots, smooth a small amount
                                                    of leave-in over the lengths
                                                    if it feels dry
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d3-4'
                                                />
                                                <span className='step-text'>
                                                    No tight ponytails or buns
                                                    today &mdash; give your
                                                    roots a break
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d3-5'
                                                />
                                                <span className='step-text'>
                                                    Satin or silk tonight
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </article>

                            {/* DAY 4 */}
                            <article
                                className='day-card'
                                data-day='4'>
                                <button
                                    className='day-head'
                                    type='button'>
                                    <span className='day-num'>04</span>
                                    <div className='day-title'>
                                        <span className='eyebrow eyebrow-mute'>
                                            Day 4
                                        </span>
                                        <h3>Micro-Mask</h3>
                                    </div>
                                    <div className='day-meta'>
                                        <div className='mini-track'>
                                            <div className='mini-fill'></div>
                                        </div>
                                        <span className='check-badge'>○</span>
                                        <span className='chev'></span>
                                    </div>
                                </button>
                                <div className='day-body'>
                                    <div className='day-body-inner'>
                                        <ul className='steps'>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d4-1'
                                                />
                                                <span className='step-text'>
                                                    5-minute hydrating mask in
                                                    the shower &mdash; work it
                                                    through mid-lengths to ends,
                                                    never the roots (it weighs
                                                    them down)
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d4-2'
                                                />
                                                <span className='step-text'>
                                                    Rinse well &mdash; leftover
                                                    product makes hair feel
                                                    heavy and dull, and blocks
                                                    moisture from getting in
                                                    next time
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d4-3'
                                                />
                                                <span className='step-text'>
                                                    Heat protectant, leave-in
                                                    cream, blow dry as usual.
                                                    Finish with one drop of oil
                                                    on the ends
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d4-4'
                                                />
                                                <span className='step-text'>
                                                    Pick a soft,
                                                    low-manipulation style for
                                                    the next two days &mdash;
                                                    loose waves, a soft braid
                                                    overnight, or leave it down
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d4-5'
                                                />
                                                <span className='step-text'>
                                                    Satin or silk tonight
                                                </span>
                                            </li>
                                        </ul>
                                        <div className='branch-row'>
                                            <div className='branch'>
                                                <h5>Hair feels balanced?</h5>
                                                <p>
                                                    Continue as written. Your
                                                    moisture rhythm is finding
                                                    its groove.
                                                </p>
                                            </div>
                                            <div className='branch'>
                                                <h5>Still very dry?</h5>
                                                <p>
                                                    Leave your Day 4 mask on a
                                                    few minutes longer with a
                                                    shower cap. And double-check
                                                    you&rsquo;re rinsing
                                                    thoroughly &mdash; leftover
                                                    product dries hair out over
                                                    time.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            {/* DAY 5 */}
                            <article
                                className='day-card'
                                data-day='5'>
                                <button
                                    className='day-head'
                                    type='button'>
                                    <span className='day-num'>05</span>
                                    <div className='day-title'>
                                        <span className='eyebrow eyebrow-mute'>
                                            Day 5
                                        </span>
                                        <h3>Strength Check</h3>
                                    </div>
                                    <div className='day-meta'>
                                        <div className='mini-track'>
                                            <div className='mini-fill'></div>
                                        </div>
                                        <span className='check-badge'>○</span>
                                        <span className='chev'></span>
                                    </div>
                                </button>
                                <div className='day-body'>
                                    <div className='day-body-inner'>
                                        <ul className='steps'>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d5-1'
                                                />
                                                <span className='step-text'>
                                                    Assess: does your hair feel
                                                    limp or stretchy when wet,
                                                    snap easily when you brush,
                                                    or does your blowout fall
                                                    flat by end of day?
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d5-2'
                                                />
                                                <span className='step-text'>
                                                    If yes &mdash; use a light
                                                    protein-based conditioner or
                                                    bond repair treatment.
                                                    Follow the bottle (3&ndash;5
                                                    minutes). Rinse well, finish
                                                    with regular leave-in
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d5-3'
                                                />
                                                <span className='step-text'>
                                                    If hair feels strong already
                                                    &mdash; skip the protein,
                                                    dry shampoo your roots,
                                                    brush through, and go
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d5-4'
                                                />
                                                <span className='step-text'>
                                                    Not sure? Skip it. Too much
                                                    moisture is easy to fix. Too
                                                    much protein is not
                                                </span>
                                            </li>
                                        </ul>
                                        <div className='day-tip'>
                                            <strong>A note on protein</strong>
                                            Too much protein makes hair feel
                                            stiff and straw-like &mdash; the
                                            same problem we&rsquo;re trying to
                                            solve. Think of it like a vitamin:
                                            take it when you need it, skip it
                                            when you don&rsquo;t. Once a week is
                                            plenty for most people. Many
                                            won&rsquo;t need it at all.
                                        </div>
                                    </div>
                                </div>
                            </article>

                            {/* DAY 6 */}
                            <article
                                className='day-card'
                                data-day='6'>
                                <button
                                    className='day-head'
                                    type='button'>
                                    <span className='day-num'>06</span>
                                    <div className='day-title'>
                                        <span className='eyebrow eyebrow-mute'>
                                            Day 6
                                        </span>
                                        <h3>Easy Style Day</h3>
                                    </div>
                                    <div className='day-meta'>
                                        <div className='mini-track'>
                                            <div className='mini-fill'></div>
                                        </div>
                                        <span className='check-badge'>○</span>
                                        <span className='chev'></span>
                                    </div>
                                </button>
                                <div className='day-body'>
                                    <div className='day-body-inner'>
                                        <ul className='steps'>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d6-1'
                                                />
                                                <span className='step-text'>
                                                    Skip washing today &mdash;
                                                    let your natural oils
                                                    condition your scalp
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d6-2'
                                                />
                                                <span className='step-text'>
                                                    Loose low ponytail, soft
                                                    braid, or claw clip. No
                                                    tight elastics or slick buns
                                                    &mdash; they pull on edges
                                                    and cause breakage at the
                                                    hairline
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d6-3'
                                                />
                                                <span className='step-text'>
                                                    If roots look greasy, a
                                                    light dusting of dry shampoo
                                                    is fine. Don&rsquo;t pile it
                                                    on &mdash; too much causes
                                                    buildup
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d6-4'
                                                />
                                                <span className='step-text'>
                                                    One drop of hair oil rubbed
                                                    between your palms, then
                                                    smoothed over the ends only
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d6-5'
                                                />
                                                <span className='step-text'>
                                                    Silk or satin pillowcase
                                                    tonight &mdash; last night
                                                    before your Day 7 check-in
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </article>

                            {/* DAY 7 */}
                            <article
                                className='day-card'
                                data-day='7'>
                                <button
                                    className='day-head'
                                    type='button'>
                                    <span className='day-num'>07</span>
                                    <div className='day-title'>
                                        <span className='eyebrow eyebrow-mute'>
                                            Day 7
                                        </span>
                                        <h3>Checkpoint</h3>
                                    </div>
                                    <div className='day-meta'>
                                        <div className='mini-track'>
                                            <div className='mini-fill'></div>
                                        </div>
                                        <span className='check-badge'>○</span>
                                        <span className='chev'></span>
                                    </div>
                                </button>
                                <div className='day-body'>
                                    <div className='day-body-inner'>
                                        <p
                                            style={{
                                                fontStyle: "italic",
                                                color: "#4a4a4a",
                                                marginBottom: "18px",
                                            }}>
                                            Three objective checks. You&rsquo;re
                                            collecting data &mdash; not judging
                                            your hair. The results tell you
                                            exactly what to carry forward.
                                        </p>
                                        <ul className='steps'>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d7-1'
                                                />
                                                <span className='step-text'>
                                                    <strong
                                                        style={{
                                                            fontFamily:
                                                                "'Inter',sans-serif",
                                                            fontSize: "0.72rem",
                                                            letterSpacing:
                                                                "0.18em",
                                                            textTransform:
                                                                "uppercase",
                                                            display: "block",
                                                            marginBottom: "4px",
                                                        }}>
                                                        Check 1 &mdash; End feel
                                                    </strong>
                                                    Soft and bendy = moisture is
                                                    balancing &mdash; keep
                                                    going. Rough or crunchy =
                                                    ends need more sealing; a
                                                    small trim may help. Limp or
                                                    mushy = too much
                                                    conditioner, not enough
                                                    strength &mdash; add a
                                                    protein step next wash.
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d7-2'
                                                />
                                                <span className='step-text'>
                                                    <strong
                                                        style={{
                                                            fontFamily:
                                                                "'Inter',sans-serif",
                                                            fontSize: "0.72rem",
                                                            letterSpacing:
                                                                "0.18em",
                                                            textTransform:
                                                                "uppercase",
                                                            display: "block",
                                                            marginBottom: "4px",
                                                        }}>
                                                        Check 2 &mdash; The
                                                        stretch test
                                                    </strong>
                                                    Pluck one wet strand and
                                                    gently pull. Stretches a
                                                    little then bounces back =
                                                    healthy. Snaps right away =
                                                    needs more moisture (or you
                                                    overdid the protein).
                                                    Stretches like a rubber band
                                                    and stays stretched = needs
                                                    more protein. Always test it
                                                    wet &mdash; dry hair gives a
                                                    false reading.
                                                </span>
                                            </li>
                                            <li className='step'>
                                                <input
                                                    type='checkbox'
                                                    data-id='d7-3'
                                                />
                                                <span className='step-text'>
                                                    <strong
                                                        style={{
                                                            fontFamily:
                                                                "'Inter',sans-serif",
                                                            fontSize: "0.72rem",
                                                            letterSpacing:
                                                                "0.18em",
                                                            textTransform:
                                                                "uppercase",
                                                            display: "block",
                                                            marginBottom: "4px",
                                                        }}>
                                                        Check 3 &mdash; The
                                                        brush test
                                                    </strong>
                                                    Brush through dry hair from
                                                    ends up. Slides smoothly =
                                                    hair is shinier and
                                                    healthier. Still catching =
                                                    give it another 7 days
                                                    before changing anything.
                                                    Hair takes time.
                                                </span>
                                            </li>
                                        </ul>
                                        <div className='check-quote'>
                                            &ldquo;If ends feel soft and pliable
                                            and hair stretches with a slight
                                            spring-back &mdash; your moisture
                                            rhythm is working.&rdquo;
                                        </div>
                                        <div className='check-foot'>
                                            Day 7 pass condition &mdash; keep
                                            this protocol for 14&ndash;21 more
                                            days. Length retention follows
                                            breakage reduction. Passed Day 7?
                                            Lock it in with the 21-day routine
                                            below.
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                </section>

                {/* ============ PRODUCT MAP + TROUBLESHOOT ============ */}
                <section className='section bg-paper'>
                    <div className='page'>
                        <div className='pagemark'>
                            <span className='label'>The Hair Insider</span>
                            <span className='num'>08</span>
                        </div>

                        <div className='twocol'>
                            <div>
                                <span className='script'>What to use</span>
                                <h2>Starter Product Map</h2>
                                <p className='lead'>
                                    Brand-agnostic. Water is the only true
                                    hydrator for hair &mdash; everything else
                                    supports or seals it.
                                </p>

                                <div className='product-row'>
                                    <div className='label'>Hydrators</div>
                                    <div className='desc'>
                                        Water-based mists or diluted aloe vera.
                                        Applied first, always.
                                    </div>
                                </div>
                                <div className='product-row'>
                                    <div className='label'>Conditioners</div>
                                    <div className='desc'>
                                        High-slip rinse-out formulas with fatty
                                        alcohols for detangling. Wash day only
                                        &mdash; never layered over styled hair.
                                    </div>
                                </div>
                                <div className='product-row'>
                                    <div className='label'>Leave-ins</div>
                                    <div className='desc'>
                                        Water-based. Lighter for fine hair.
                                        Creamier for coarser or high-density
                                        strands that absorb quickly.
                                    </div>
                                </div>
                                <div className='product-row'>
                                    <div className='label'>Sealers</div>
                                    <div className='desc'>
                                        Light oils (jojoba, argan) for most.
                                        Heavier only if ends are chronically
                                        rough. Ends only &mdash; not mid-shaft
                                        or scalp.
                                    </div>
                                </div>
                                <div className='product-row'>
                                    <div className='label'>Protein</div>
                                    <div className='desc'>
                                        Light hydrolyzed protein &mdash; when
                                        hair is limp, mushy, or over-stretched
                                        only. Not a weekly step.
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className='script'>
                                    When things go wrong
                                </span>
                                <h2>Troubleshooting</h2>
                                <p className='lead'>
                                    Match the symptom to the fix. Most issues
                                    resolve within one wash cycle.
                                </p>

                                <div className='trouble'>
                                    <h4>Dry by midday</h4>
                                    <p>
                                        Increase water-based mist. Reduce oils
                                        &mdash; heavy oil over low moisture
                                        blocks hydration entry. Add steam during
                                        deep conditioning.
                                    </p>
                                </div>
                                <div className='trouble'>
                                    <h4>Styles won&rsquo;t hold</h4>
                                    <p>
                                        Ensure hair is fully dry before takedown
                                        &mdash; damp sets collapse. A light
                                        protein step may help if hair feels soft
                                        and limp.
                                    </p>
                                </div>
                                <div className='trouble'>
                                    <h4>Ends snapping</h4>
                                    <p>
                                        Split ends wick moisture. A dusting trim
                                        removes the damaged tip. Then seal ends
                                        consistently and reduce daily end
                                        contact.
                                    </p>
                                </div>
                                <div className='trouble'>
                                    <h4>Itchy / flaking</h4>
                                    <p>
                                        Clarify with a gentle shampoo, then
                                        resume hydration plan. Avoid heavy oils
                                        and butters directly on the scalp.
                                    </p>
                                </div>
                                <div className='trouble'>
                                    <h4>Stiff / brittle</h4>
                                    <p>
                                        Likely protein overload. Skip all
                                        protein and focus on moisture only for
                                        the full next wash cycle until
                                        elasticity returns.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============ TIMELINE + UPSELL ============ */}
                <section className='section upsell-section'>
                    <div className='page'>
                        <div
                            className='pagemark'
                            style={{
                                borderColor: "rgba(26,26,26,0.3)",
                            }}>
                            <span className='label'>The Hair Insider</span>
                            <span className='num'>10</span>
                        </div>

                        <div className='upsell-grid'>
                            <div>
                                <span className='script'>
                                    What happens after
                                </span>
                                <h2>Realistic Timeline</h2>
                                <p className='lead'>
                                    These are what you may <em>feel</em> &mdash;
                                    not guarantees. Hair health builds across
                                    consistent cycles, not single weeks.
                                </p>

                                <div className='timeline'>
                                    <div className='tl-step'>
                                        <div className='tl-dot'>1&ndash;3</div>
                                        <div className='tl-body'>
                                            <h4>Days 1&ndash;3</h4>
                                            <p>
                                                Detangling friction softens.
                                                Hair feels more cooperative.
                                                Frizz may settle as the cuticle
                                                begins to lie flatter.
                                            </p>
                                        </div>
                                    </div>
                                    <div className='tl-step'>
                                        <div className='tl-dot'>4&ndash;7</div>
                                        <div className='tl-body'>
                                            <h4>Days 4&ndash;7</h4>
                                            <p>
                                                Ends feel softer and more
                                                pliable. Styles hold longer
                                                without extra product.
                                                Elasticity feels more
                                                consistent.
                                            </p>
                                        </div>
                                    </div>
                                    <div className='tl-step'>
                                        <div className='tl-dot'>21+</div>
                                        <div className='tl-body'>
                                            <h4>Days 14&ndash;21+</h4>
                                            <p>
                                                Breakage reduction accumulates.
                                                The length that was already
                                                growing stops being lost.
                                                Visible retention begins here.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className='script'>Lock it in</span>
                                <h2>Ready to keep your Day-7 results?</h2>
                                <p className='lead'>
                                    Build the 21-day rhythm inside{" "}
                                    <em>How To Grow Your Hair</em> &mdash; $197,
                                    lifetime access, 7-day guarantee.
                                </p>

                                <div className='offer-card'>
                                    <h3>How To Grow Your Hair</h3>
                                    <p className='lead'>
                                        If this week changed how your ends feel,
                                        build the full 21-day routine with
                                        context to make it permanent.
                                    </p>
                                    <ul className='offer-list'>
                                        <li>
                                            Step-by-step moisture rhythm built
                                            for your hair
                                        </li>
                                        <li>
                                            Product dosages matched to your hair
                                            density
                                        </li>
                                        <li>
                                            Protective-style maintenance that
                                            preserves length
                                        </li>
                                        <li>
                                            Full troubleshooting flow for any
                                            setback
                                        </li>
                                    </ul>
                                    <span className='price'>$197</span>
                                    <div className='price-meta'>
                                        One-time · Lifetime access · 7-day
                                        money-back guarantee
                                    </div>
                                    <a
                                        href='#'
                                        className='btn btn-filled'
                                        style={{
                                            width: "100%",
                                            textAlign: "center",
                                        }}>
                                        Get the 21-day routine
                                    </a>
                                    <div className='bonus-card'>
                                        <h5>Limited bonus</h5>
                                        <p>
                                            Routine Map template &mdash;
                                            implement your full routine in under
                                            an hour.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============ FOOTER ============ */}
                <footer>
                    <div className='brand'>
                        The Hair Insider · the-hair-insider.com
                    </div>
                    <div className='tag'>Education-first hair care</div>
                </footer>

                {/* ============ CELEBRATION OVERLAY ============ */}
                <div
                    className='celebrate'
                    id='celebrate'>
                    <div className='celebrate-card'>
                        <span className='script'>Day 7 complete</span>
                        <h3>You did the work.</h3>
                        <p>
                            Run your three checks above &mdash; that&rsquo;s
                            your real data. If your ends feel softer and your
                            hair has that slight spring-back, your moisture
                            rhythm is working. The full 21-day routine is where
                            retention actually starts to show.
                        </p>
                        <a
                            href='#'
                            className='btn btn-filled'>
                            Build your 21-day rhythm now
                        </a>
                        <div>
                            <button
                                className='celebrate-close'
                                id='celebrateClose'>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
