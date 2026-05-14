"use client";

import { useEffect, useRef } from "react";
import { initWorkbook } from "./workbookInit";

const CSS = `
    :root{
    --sage:#b8bca7;--sage-deep:#8f9379;--sage-soft:#cdd1bd;--paper:#ebe5d8;
    --cream:#f3eee5;--cream-deep:#e9e2d1;--blue:#d4dde3;--ink:#1a1a1a;--mute:#6e6e6e;
    --line:rgba(26,26,26,0.12);
    --shadow:0 10px 40px -20px rgba(26,26,26,0.25);
    --shadow-soft:0 4px 24px -12px rgba(26,26,26,0.18);
    }
    #workbook-root *,#workbook-root *::before,#workbook-root *::after{box-sizing:border-box}
    html{scroll-behavior:smooth}
    #workbook-root{
    font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
    font-weight:400;color:var(--ink);background:var(--cream);line-height:1.6;
    -webkit-font-smoothing:antialiased;overflow-x:hidden;min-height:100dvh;
    }
    #workbook-root img{max-width:100%;display:block}
    #workbook-root button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
    #workbook-root input,#workbook-root textarea,#workbook-root select{font-family:inherit;color:inherit}

    .serif{font-family:'Cormorant Garamond',Georgia,serif}
    #workbook-root h1,#workbook-root h2,#workbook-root h3,#workbook-root h4{
    font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;letter-spacing:-0.01em;margin:0 0 0.4em
    }
    #workbook-root h1{font-size:clamp(2.4rem,7vw,4.2rem);line-height:1.05;font-weight:400}
    #workbook-root h2{font-size:clamp(1.9rem,4.5vw,3rem);line-height:1.1;font-weight:400}
    #workbook-root h3{font-size:clamp(1.4rem,3vw,1.8rem);line-height:1.2}
    #workbook-root h4{font-size:1.15rem;line-height:1.3;font-weight:600;font-family:'Inter',sans-serif;letter-spacing:0.02em;text-transform:uppercase}
    #workbook-root p{margin:0 0 1em}
    .eyebrow{font-family:'Inter',sans-serif;font-size:0.72rem;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:var(--sage-deep);margin-bottom:0.8em}
    .quote{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1.15rem,2.4vw,1.5rem);line-height:1.45;color:var(--ink);max-width:36ch}

    .wrap{max-width:920px;margin:0 auto;padding:0 24px}
    section{padding:80px 0;position:relative;scroll-margin-top:140px}
    section:nth-of-type(even){background:var(--paper)}
    .divider{width:64px;height:1px;background:var(--sage-deep);margin:0 0 28px;opacity:0.6}
    .page-mark{display:inline-block;font-size:0.7rem;font-weight:500;letter-spacing:0.18em;color:var(--sage-deep);text-transform:uppercase;margin-bottom:18px;font-family:'Inter',sans-serif}

    .hero{
    min-height:100vh;
    background:linear-gradient(180deg,var(--sage-soft) 0%,var(--sage) 55%,var(--sage-deep) 100%);
    color:var(--cream);display:flex;flex-direction:column;justify-content:center;align-items:center;
    text-align:center;padding:60px 24px 80px;position:relative;overflow:hidden;
    }
    .hero::before{
    content:"";position:absolute;inset:0;
    background:radial-gradient(circle at 30% 20%,rgba(243,238,229,0.18),transparent 50%),
                radial-gradient(circle at 70% 80%,rgba(243,238,229,0.12),transparent 50%);
    pointer-events:none;
    }
    .hero-mark{font-size:0.78rem;letter-spacing:0.4em;font-weight:500;text-transform:uppercase;margin-bottom:48px;opacity:0.85}
    .hero h1{font-size:clamp(2.8rem,9vw,5.4rem);font-style:italic;font-weight:300;margin-bottom:0.3em;max-width:14ch}
    .hero-sub{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1.1rem,2.4vw,1.5rem);margin-bottom:48px;opacity:0.95}
    .hero-rhythm{display:flex;gap:18px;align-items:center;flex-wrap:wrap;justify-content:center;font-family:'Inter',sans-serif;font-size:0.78rem;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:64px;font-weight:500}
    .hero-rhythm span{position:relative}
    .hero-rhythm span:not(:last-child)::after{content:"·";margin-left:18px;opacity:0.6}
    .hero-author{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.1rem;opacity:0.9;margin-bottom:6px}
    .hero-author-name{font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:500}
    .hero-scroll{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);font-size:0.7rem;letter-spacing:0.3em;text-transform:uppercase;opacity:0.7;animation:wbFloat 2.4s ease-in-out infinite}
    @keyframes wbFloat{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(6px)}}

    .dash{
    position:sticky;top:0;z-index:50;
    background:rgba(243,238,229,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
    border-bottom:1px solid var(--line);padding:14px 24px;transition:all 0.3s ease;
    }
    .dash-inner{max-width:920px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap;justify-content:space-between}
    .dash-brand{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.1rem;color:var(--ink);font-weight:500}
    .dash-nav{display:flex;gap:20px;align-items:center}
    .dash-nav a{font-family:'Inter',sans-serif;font-size:0.68rem;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:var(--mute);text-decoration:none;transition:color 0.2s}
    .dash-nav a:hover{color:var(--ink)}
    .dash-stats{display:flex;gap:22px;flex-wrap:wrap;align-items:center}
    .dash-stat{display:flex;flex-direction:column;align-items:flex-start;line-height:1.1}
    .dash-stat-num{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:500;color:var(--ink)}
    .dash-stat-num.flame::before{content:"";display:inline-block;width:10px;height:10px;background:var(--sage-deep);border-radius:50%;margin-right:6px;vertical-align:middle;animation:wbPulse 2s ease-in-out infinite}
    @keyframes wbPulse{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}
    .dash-stat-label{font-size:0.62rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--mute);font-weight:500;margin-top:2px}
    .dash-progress{flex:1;min-width:120px;max-width:240px}
    .dash-progress-track{height:4px;background:var(--cream-deep);border-radius:4px;overflow:hidden;margin-top:4px}
    .dash-progress-fill{height:100%;background:linear-gradient(90deg,var(--sage),var(--sage-deep));border-radius:4px;width:0%;transition:width 0.6s cubic-bezier(0.4,0,0.2,1)}
    .dash-menu{
    background:none;border:1px solid var(--line);border-radius:999px;padding:8px 14px;
    font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;font-weight:500;color:var(--ink);transition:all 0.2s ease;
    }
    .dash-menu:hover{background:var(--ink);color:var(--cream);border-color:var(--ink)}
    @media (max-width:600px){
    .dash-stats{gap:14px}
    .dash-stat-num{font-size:1.2rem}
    .dash-progress{order:5;width:100%;max-width:none;flex-basis:100%}
    }

    .toc-drawer{
    position:fixed;top:0;right:-100%;width:min(360px,90vw);height:100vh;
    background:var(--cream);z-index:100;padding:32px 28px;overflow-y:auto;
    transition:right 0.4s cubic-bezier(0.4,0,0.2,1);box-shadow:-20px 0 60px -20px rgba(0,0,0,0.2);
    }
    .toc-drawer.open{right:0}
    .toc-close{position:absolute;top:20px;right:20px;font-size:1.5rem;font-weight:300;color:var(--mute);background:none;border:none;cursor:pointer;line-height:1}
    .toc-drawer h3{margin-top:12px;margin-bottom:24px;font-style:italic;font-weight:400}
    .toc-drawer ol{list-style:none;padding:0;margin:0;counter-reset:toc}
    .toc-drawer li{counter-increment:toc;border-bottom:1px solid var(--line);padding:0}
    .toc-drawer li a{display:flex;align-items:center;gap:14px;padding:14px 0;color:var(--ink);text-decoration:none;font-size:0.95rem;transition:padding 0.2s ease}
    .toc-drawer li a:hover{padding-left:6px}
    .toc-drawer li a::before{content:counter(toc,decimal-leading-zero);font-family:'Cormorant Garamond',serif;font-style:italic;color:var(--sage-deep);font-size:1.05rem;min-width:28px}
    .toc-check{width:14px;height:14px;border:1px solid var(--sage-deep);border-radius:50%;margin-left:auto;flex-shrink:0;transition:all 0.2s ease}
    .toc-check.done{background:var(--sage-deep);box-shadow:inset 0 0 0 3px var(--cream)}
    .scrim{position:fixed;inset:0;background:rgba(26,26,26,0.4);z-index:99;opacity:0;pointer-events:none;transition:opacity 0.3s ease}
    .scrim.open{opacity:1;pointer-events:auto}

    .card{background:var(--cream);border-radius:18px;padding:32px 28px;box-shadow:var(--shadow-soft);border:1px solid rgba(184,188,167,0.3)}
    .card-paper{background:var(--paper)}
    .section-head{margin-bottom:36px}
    .section-head h2{margin-bottom:0.2em}
    .section-sub{color:var(--mute);font-size:1rem;max-width:50ch}

    .check-row{display:flex;align-items:flex-start;gap:14px;padding:14px 18px;border-radius:12px;cursor:pointer;transition:background 0.2s ease,transform 0.15s ease;user-select:none}
    .check-row:hover{background:rgba(184,188,167,0.15)}
    .check-row.checked{background:rgba(184,188,167,0.25)}
    .check-row.checked .check-label{color:var(--mute);text-decoration:line-through;text-decoration-color:rgba(110,110,110,0.4)}
    .check-box{flex-shrink:0;width:22px;height:22px;border:1.5px solid var(--sage-deep);border-radius:6px;background:var(--cream);display:flex;align-items:center;justify-content:center;margin-top:2px;transition:all 0.2s ease}
    .check-row.checked .check-box{background:var(--sage-deep);border-color:var(--sage-deep)}
    .check-box svg{width:14px;height:14px;color:var(--cream);opacity:0;transform:scale(0.5);transition:all 0.2s ease}
    .check-row.checked .check-box svg{opacity:1;transform:scale(1)}
    .check-label{font-size:0.98rem;line-height:1.4;flex:1}
    .check-pill{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;border:1px solid var(--line);background:var(--cream);cursor:pointer;transition:all 0.2s ease;font-size:0.9rem;user-select:none}
    .check-pill:hover{border-color:var(--sage-deep)}
    .check-pill.on{background:var(--sage-deep);color:var(--cream);border-color:var(--sage-deep)}

    .two-col{display:grid;grid-template-columns:1fr;gap:24px}
    @media (min-width:720px){.two-col{grid-template-columns:1fr 1fr;gap:32px}}
    .three-col{display:grid;grid-template-columns:1fr;gap:18px}
    @media (min-width:720px){.three-col{grid-template-columns:repeat(3,1fr);gap:20px}}

    .fld{margin-bottom:18px}
    .fld-label{display:block;font-size:0.72rem;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:var(--sage-deep);margin-bottom:8px}
    .fld input[type="text"],.fld input[type="date"],.fld textarea,.fld select{
    width:100%;padding:12px 14px;background:var(--cream);border:1px solid var(--line);border-radius:10px;
    font-family:'Cormorant Garamond',serif;font-size:1.1rem;transition:border 0.2s ease,box-shadow 0.2s ease;
    }
    .fld input:focus,.fld textarea:focus,.fld select:focus{outline:none;border-color:var(--sage-deep);box-shadow:0 0 0 3px rgba(143,147,121,0.15)}
    .fld textarea{min-height:88px;resize:vertical;line-height:1.55}
    .fld-hint{font-size:0.8rem;color:var(--mute);margin-top:6px;font-style:italic}

    .choice-set{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
    .choice{padding:10px 18px;border-radius:999px;border:1px solid var(--line);background:var(--cream);cursor:pointer;font-size:0.92rem;transition:all 0.2s ease;user-select:none}
    .choice:hover{border-color:var(--sage-deep)}
    .choice.on{background:var(--ink);color:var(--cream);border-color:var(--ink)}

    .steps{display:grid;grid-template-columns:1fr;gap:20px;margin-top:32px}
    @media (min-width:720px){.steps{grid-template-columns:repeat(3,1fr)}}
    .step{background:var(--cream);border-radius:18px;padding:32px 26px;position:relative;border:1px solid rgba(184,188,167,0.4);transition:transform 0.3s ease,box-shadow 0.3s ease}
    .step:hover{transform:translateY(-4px);box-shadow:var(--shadow)}
    .step-num{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:3.2rem;font-weight:300;color:var(--sage-deep);line-height:1;margin-bottom:14px}
    .step h3{margin-bottom:0.4em;font-style:italic}
    .step p{font-size:0.95rem;color:var(--mute);margin:0}

    .wheel-wrap{display:grid;grid-template-columns:1fr;gap:36px;align-items:center;margin-top:32px}
    @media (min-width:760px){.wheel-wrap{grid-template-columns:1fr 1fr}}
    .wheel-svg{width:100%;max-width:380px;margin:0 auto;display:block}
    .wheel-slice{fill:rgba(184,188,167,0.18);stroke:var(--sage-deep);stroke-width:1;transition:fill 0.3s ease}
    .wheel-fill{fill:var(--sage-deep);opacity:0.7;transition:opacity 0.3s ease}
    .wheel-label{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;fill:var(--ink);text-anchor:middle}
    .wheel-controls{display:grid;grid-template-columns:1fr;gap:14px}
    .wheel-row{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center}
    .wheel-row label{font-size:0.92rem;font-weight:500}
    .wheel-row input[type="range"]{-webkit-appearance:none;appearance:none;width:100%;height:4px;background:var(--cream-deep);border-radius:4px;outline:none;grid-column:1 / -1}
    .wheel-row input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;background:var(--sage-deep);border-radius:50%;cursor:pointer;border:2px solid var(--cream);box-shadow:0 1px 4px rgba(0,0,0,0.15)}
    .wheel-row input[type="range"]::-moz-range-thumb{width:18px;height:18px;background:var(--sage-deep);border-radius:50%;cursor:pointer;border:2px solid var(--cream)}
    .wheel-value{font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:500;min-width:32px;text-align:right;color:var(--sage-deep)}

    .matrix-wrap{margin-top:24px}
    .matrix-add{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
    .matrix-add input{flex:1;min-width:180px;padding:12px 14px;border-radius:10px;border:1px solid var(--line);background:var(--cream);font-size:0.95rem}
    .matrix-add button{background:var(--ink);color:var(--cream);padding:12px 22px;border-radius:10px;font-size:0.85rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:500}
    .matrix-grid{display:grid;grid-template-columns:auto 1fr 1fr;grid-template-rows:auto 1fr 1fr;gap:0;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:var(--cream);min-height:520px;position:relative}
    .matrix-axis-x,.matrix-axis-y{background:var(--cream-deep);font-size:0.7rem;letter-spacing:0.16em;text-transform:uppercase;font-weight:600;color:var(--sage-deep);display:flex;align-items:center;justify-content:center;padding:10px}
    .matrix-axis-y{writing-mode:vertical-rl;transform:rotate(180deg);min-width:42px}
    .matrix-corner{background:var(--cream-deep)}
    .matrix-cell{padding:18px;position:relative;display:flex;flex-direction:column;gap:8px;min-height:220px;align-content:flex-start;transition:background 0.2s ease}
    .matrix-cell.drag-over{background:rgba(184,188,167,0.2)}
    .matrix-cell + .matrix-cell{border-left:1px solid var(--line)}
    .matrix-grid > .matrix-cell:nth-child(5),.matrix-grid > .matrix-cell:nth-child(6){border-top:1px solid var(--line)}
    .matrix-cell-title{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.25rem;color:var(--ink);margin-bottom:6px}
    .matrix-cell-hint{font-size:0.7rem;color:var(--mute);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px}
    .matrix-item{background:var(--paper);padding:8px 12px;border-radius:8px;font-size:0.88rem;cursor:grab;border:1px solid var(--line);display:flex;align-items:center;gap:8px;transition:transform 0.15s ease,box-shadow 0.15s ease}
    .matrix-item:active{cursor:grabbing}
    .matrix-item:hover{box-shadow:var(--shadow-soft);transform:translateY(-1px)}
    .matrix-item.dragging{opacity:0.4}
    .matrix-item button{color:var(--mute);font-size:1rem;padding:0 0 0 6px;line-height:1;opacity:0.5;transition:opacity 0.2s ease}
    .matrix-item button:hover{opacity:1;color:var(--ink)}
    @media (max-width:600px){
    .matrix-grid{min-height:auto}
    .matrix-cell{min-height:140px;padding:14px}
    .matrix-cell-title{font-size:1.05rem}
    }

    .tracker-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:14px}
    .week-nav{display:flex;gap:8px;align-items:center;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.1rem}
    .week-nav button{background:var(--cream);border:1px solid var(--line);width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.9rem;transition:all 0.2s ease}
    .week-nav button:hover{background:var(--ink);color:var(--cream);border-color:var(--ink)}
    .week-streak{display:inline-flex;align-items:center;gap:6px;background:var(--sage-deep);color:var(--cream);padding:6px 14px;border-radius:999px;font-size:0.78rem;letter-spacing:0.1em;text-transform:uppercase;font-weight:500}
    .habit-table{width:100%;border-collapse:collapse;background:var(--cream);border-radius:14px;overflow:hidden}
    .habit-table th,.habit-table td{padding:10px 6px;text-align:center;font-size:0.85rem;border-bottom:1px solid var(--line)}
    .habit-table th{background:var(--cream-deep);font-size:0.68rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--sage-deep);padding:14px 6px}
    .habit-table th:first-child,.habit-table td:first-child{text-align:left;padding-left:14px;font-family:'Cormorant Garamond',serif;font-size:1rem;font-style:italic;min-width:120px}
    .habit-table tr:last-child td{border-bottom:none}
    .habit-table td.habit-cell{cursor:pointer;width:14.28%;transition:background 0.15s ease}
    .habit-table td.habit-cell:hover{background:rgba(184,188,167,0.15)}
    .habit-dot{display:inline-block;width:18px;height:18px;border-radius:50%;border:1px solid var(--line);background:var(--cream);transition:all 0.2s ease}
    .habit-cell.on .habit-dot{background:var(--sage-deep);border-color:var(--sage-deep)}
    .habit-row-input{background:transparent;border:none;outline:none;font-family:'Cormorant Garamond',serif;font-size:1rem;font-style:italic;width:100%;padding:4px 0}
    .habit-row-input:focus{border-bottom:1px solid var(--sage-deep)}

    .note-strip{background:var(--paper);border-left:3px solid var(--sage-deep);padding:20px 22px;margin:24px 0;border-radius:0 12px 12px 0}
    .note-strip-label{font-size:0.7rem;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:var(--sage-deep);margin-bottom:6px}
    .note-strip p{margin:0;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.1rem;line-height:1.5}

    .journal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:14px}
    .journal-date{background:var(--cream);border:1px solid var(--line);padding:8px 16px;border-radius:999px;font-family:'Cormorant Garamond',serif;font-size:1.1rem;cursor:pointer;display:inline-flex;align-items:center;gap:8px}
    .journal-date input{border:none;background:transparent;outline:none;font:inherit;cursor:pointer;color:inherit}
    .water-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
    .water-cup{width:32px;height:38px;border:1.5px solid var(--sage-deep);border-radius:0 0 8px 8px;cursor:pointer;position:relative;transition:all 0.2s ease;background:var(--cream)}
    .water-cup.on{background:linear-gradient(180deg,var(--blue),#a5b8c4)}
    .mood-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}
    .mood-btn{width:44px;height:44px;border-radius:50%;background:var(--cream);border:1px solid var(--line);font-size:1.3rem;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s ease}
    .mood-btn:hover{transform:scale(1.1)}
    .mood-btn.on{background:var(--sage);border-color:var(--sage-deep);box-shadow:0 4px 12px rgba(143,147,121,0.3)}

    .smart-letter{font-family:'Cormorant Garamond',serif;font-size:3rem;font-style:italic;font-weight:300;color:var(--sage-deep);line-height:1;margin-right:18px;flex-shrink:0}
    .smart-row{display:flex;align-items:flex-start;gap:14px;margin-bottom:18px}
    .smart-content{flex:1}
    .smart-title{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.3rem;margin-bottom:4px}
    .smart-example{font-size:0.82rem;color:var(--mute);font-style:italic;margin-bottom:8px}

    .why-step{background:var(--cream);border-radius:14px;padding:22px 24px;margin-bottom:16px;border-left:3px solid var(--sage-deep);position:relative}
    .why-num{position:absolute;top:18px;right:24px;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.6rem;color:var(--sage-deep);opacity:0.5}
    .why-prompt{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.05rem;color:var(--mute);margin-bottom:8px;max-width:90%}

    .cover-frame{max-width:280px;margin:32px auto;border-radius:16px;overflow:hidden;box-shadow:0 30px 80px -30px rgba(26,26,26,0.4),0 0 0 8px rgba(243,238,229,0.15);position:relative;z-index:1}
    .cover-frame img{width:100%;height:auto;display:block;image-orientation:from-image}

    .sec-chip{display:inline-flex;align-items:center;gap:8px;font-size:0.7rem;letter-spacing:0.14em;text-transform:uppercase;font-weight:500;color:var(--mute);margin-left:auto}
    .sec-chip-track{width:60px;height:3px;background:var(--cream-deep);border-radius:3px;overflow:hidden}
    .sec-chip-fill{height:100%;background:var(--sage-deep);width:0;transition:width 0.5s ease}
    .section-head-row{display:flex;align-items:flex-start;flex-wrap:wrap;gap:12px}

    .cta{background:var(--sage-deep);color:var(--cream);padding:48px 32px;border-radius:22px;text-align:center;margin:32px 0 0}
    .cta h3{color:var(--cream);font-style:italic;font-weight:300;font-size:clamp(1.8rem,4vw,2.6rem);margin-bottom:0.4em}
    .cta p{color:rgba(243,238,229,0.85);margin-bottom:24px;max-width:36ch;margin-left:auto;margin-right:auto}
    .cta-btn{display:inline-block;background:var(--cream);color:var(--ink);padding:16px 36px;border-radius:999px;text-decoration:none;font-weight:500;font-size:0.82rem;letter-spacing:0.18em;text-transform:uppercase;transition:transform 0.2s ease,box-shadow 0.2s ease}
    .cta-btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px -8px rgba(0,0,0,0.3)}

    .letter{font-family:'Cormorant Garamond',serif;font-size:1.2rem;line-height:1.65;font-style:italic}
    .letter p{margin-bottom:1em}
    .signature{font-family:'Cormorant Garamond',serif;font-size:1.4rem;font-style:italic;font-weight:500;margin-top:18px}
    .signature small{display:block;font-size:0.85rem;color:var(--mute);font-style:normal;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;font-weight:500;font-family:'Inter',sans-serif}

    .reveal{opacity:0;transform:translateY(20px);transition:opacity 0.7s ease,transform 0.7s ease}
    .reveal.in{opacity:1;transform:none}

    .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(140%);background:var(--ink);color:var(--cream);padding:14px 22px;border-radius:999px;font-size:0.9rem;z-index:200;box-shadow:0 12px 40px -8px rgba(0,0,0,0.4);transition:transform 0.4s cubic-bezier(0.4,0,0.2,1);white-space:nowrap;max-width:90vw}
    .toast.show{transform:translateX(-50%) translateY(0)}

    .schedule-list{display:flex;flex-direction:column;gap:6px}
    .schedule-row{display:grid;grid-template-columns:80px 1fr;gap:12px;align-items:center}
    .schedule-row .time-input{padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:var(--cream);font-size:0.9rem;width:100%}

    .life-table{display:grid;grid-template-columns:1fr;gap:12px}
    .life-row{background:var(--cream);border-radius:12px;padding:18px 20px;border-left:3px solid var(--sage-deep)}
    .life-row-title{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.15rem;margin-bottom:10px}
    .life-row textarea{width:100%;min-height:54px;padding:8px 0;border:none;border-bottom:1px dashed var(--line);background:transparent;resize:vertical;font-family:'Cormorant Garamond',serif;font-size:1.05rem;outline:none;margin-bottom:8px}
    .life-row label{display:block;font-size:0.68rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--sage-deep);margin-top:8px;margin-bottom:4px;font-weight:600}

    .weekly-day{background:var(--cream);border-radius:12px;padding:16px 18px;margin-bottom:12px;display:grid;grid-template-columns:90px 1fr auto;gap:14px;align-items:start}
    .weekly-day-name{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.15rem;color:var(--sage-deep)}
    .weekly-day-inputs textarea{width:100%;background:transparent;border:none;border-bottom:1px dashed var(--line);resize:none;outline:none;min-height:36px;padding:4px 0;font-size:0.95rem;margin-bottom:6px;font-family:inherit}
    .weekly-done{width:28px;height:28px;border-radius:8px;border:1.5px solid var(--sage-deep);background:var(--cream);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s ease}
    .weekly-done.on{background:var(--sage-deep)}
    .weekly-done svg{opacity:0;color:var(--cream);width:16px;height:16px;transition:opacity 0.2s ease}
    .weekly-done.on svg{opacity:1}
    @media (max-width:600px){
    .weekly-day{grid-template-columns:1fr auto}
    .weekly-day-name{grid-column:1 / -1}
    }

    .foot{background:var(--ink);color:var(--cream);padding:48px 24px;text-align:center;font-size:0.85rem}
    .foot a{color:var(--cream);text-decoration:underline;text-underline-offset:3px}

    @media print{
    .dash,.toc-drawer,.scrim,.hero-scroll,.cta-btn,.dash-menu{display:none !important}
    section{padding:30px 0;page-break-inside:avoid}
    #workbook-root{background:white;color:black}
    .check-row,.check-pill,.choice,.matrix-item{break-inside:avoid}
    }
`;

const HTML = `
    <div class="dash" id="dash">
    <div class="dash-inner">
        <div class="dash-brand">The Hair Insider · Workbook</div>
        <nav class="dash-nav">
        <a href="/">Home</a>
        <a href="/account?tab=library">Library</a>
        <a href="/account">Account</a>
        </nav>
        <div class="dash-progress">
        <div style="display:flex;justify-content:space-between;font-size:0.62rem;letter-spacing:0.16em;text-transform:uppercase;color:var(--mute);font-weight:500"><span>Your progress</span><span id="dashPercent">0%</span></div>
        <div class="dash-progress-track"><div class="dash-progress-fill" id="dashFill"></div></div>
        </div>
        <div class="dash-stats">
        <div class="dash-stat"><span class="dash-stat-num flame" id="dashStreak">0</span><span class="dash-stat-label">Day streak</span></div>
        <div class="dash-stat"><span class="dash-stat-num" id="dashDays">0</span><span class="dash-stat-label">Days active</span></div>
        </div>
        <button class="dash-menu" id="tocOpen">Contents</button>
    </div>
    </div>

    <div class="scrim" id="scrim"></div>
    <aside class="toc-drawer" id="tocDrawer" aria-label="Table of contents">
    <button class="toc-close" id="tocClose" aria-label="Close">×</button>
    <h3>Your workbook</h3>
    <ol id="tocList"></ol>
    </aside>

    <header class="hero">
    <div class="hero-mark">The Hair Insider · Companion Journal</div>
    <h1>The Ultimate Hair Growth Workbook</h1>
    <p class="hero-sub">A companion journal for the woman growing her hair — and herself.</p>
    <div class="cover-frame"><img src="/workbook-cover.jpg" alt="Fishtail braid with sheer ribbons" /></div>
    <div class="hero-rhythm"><span>Reset</span><span>Restore</span><span>Repeat</span></div>
    <div class="hero-author">Written by</div>
    <div class="hero-author-name">Lauren Jackson</div>
    <div class="hero-scroll">Begin ↓</div>
    </header>

    <div class="toast" id="toast"></div>

    <main>

    <section id="sec-welcome" data-section="welcome" data-title="Welcome">
    <div class="wrap reveal">
        <span class="page-mark">Page 02 · Welcome</span>
        <div class="divider"></div>
        <h2 class="serif" style="font-style:italic">Welcome, beautiful.</h2>
        <p class="quote" style="margin-bottom:32px">"Growth isn't just about your hair — it's about how you show up for yourself every day."</p>
        <p>This workbook is your private space to slow down, reset, and track the small actions that change everything. There are no perfect entries here — just honest ones. Fill it in as often as feels good. Come back to it when you forget why you started.</p>
        <h4 style="margin-top:36px">How to use this workbook</h4>
        <p>Move through the sections in order, or jump to whatever you need today using <em>Contents</em> at the top right. Your answers save automatically on this device. The dashboard above tracks your overall progress, your day streak, and how often you return. Aim for rhythm, not perfection.</p>
        <h4 style="margin-top:36px">What's inside</h4>
        <ol style="font-family:'Cormorant Garamond',serif;font-size:1.15rem;line-height:2;padding-left:1.4em;margin-top:0">
        <li>The 3-Step Process</li>
        <li>The Essentials — tools, products &amp; non-negotiable habits</li>
        <li>Know Your Hair</li>
        <li>Haircare Rituals &amp; Intentions (daily)</li>
        <li>The Hair-Care Self Ritual Checklist</li>
        <li>The Growth Routine Checklist</li>
        <li>SMART Hair Goals</li>
        <li>The Action Priority Matrix</li>
        <li>The Wheel of Alignment</li>
        <li>The 7-Day Habit Tracker</li>
        <li>Aligned Life Goals</li>
        <li>The Weekly Growth Tracker</li>
        <li>Understanding Your Why</li>
        </ol>
        <div class="signature">With care, Lauren<small>Founder · The Hair Insider</small></div>
    </div>
    </section>

    <section id="sec-process" data-section="process" data-title="The 3-Step Process">
    <div class="wrap reveal">
        <span class="page-mark">Page 03 · The Method</span>
        <div class="section-head">
        <div class="section-head-row"><h2 class="serif">The 3-Step Process</h2></div>
        <p class="section-sub">Healthy hair isn't accidental — it's the result of a rhythm you return to. Every section in this workbook ladders back to one of these three.</p>
        </div>
        <div class="steps">
        <div class="step"><div class="step-num">01</div><h3>Reset the Scalp</h3><p>Clarify build-up, balance oil, and create the healthy environment new strands need to grow.</p></div>
        <div class="step"><div class="step-num">02</div><h3>Restore the Strands</h3><p>Rebuild moisture and protein so the length you already have stays soft, strong, and on your head.</p></div>
        <div class="step"><div class="step-num">03</div><h3>Repeat with Rhythm</h3><p>Turn it into a weekly cadence you actually keep — because consistency is the only thing that compounds.</p></div>
        </div>
        <div class="note-strip" style="margin-top:36px">
        <div class="note-strip-label">Remember</div>
        <p>Small consistent actions create visible transformation.</p>
        </div>
    </div>
    </section>

    <section id="sec-essentials" data-section="essentials" data-title="The Essentials">
    <div class="wrap reveal">
        <span class="page-mark">Page 04 · Setup</span>
        <div class="section-head">
        <div class="section-head-row">
            <h2 class="serif">The Essentials</h2>
            <div class="sec-chip"><span id="essChipPct">0%</span><div class="sec-chip-track"><div class="sec-chip-fill" data-sec-chip="essentials"></div></div></div>
        </div>
        <p class="section-sub">Build your toolkit. Check off what you already own, and earmark what's still missing.</p>
        </div>
        <div class="two-col">
        <div class="card">
            <h4 style="color:var(--sage-deep);margin-bottom:18px">Tools</h4>
            <div data-checklist="essentials-tools">
            <div class="check-row" data-id="silk-pillow"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Silk or satin pillowcase</div></div>
            <div class="check-row" data-id="microfiber"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Microfiber towel</div></div>
            <div class="check-row" data-id="wide-comb"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Wide-tooth comb</div></div>
            <div class="check-row" data-id="boar-brush"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Boar bristle brush</div></div>
            <div class="check-row" data-id="satin-scrunch"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Satin scrunchies</div></div>
            <div class="check-row" data-id="scalp-massager"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Scalp massager</div></div>
            <div class="check-row" data-id="shears"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Hair shears (for dustings)</div></div>
            </div>
        </div>
        <div class="card">
            <h4 style="color:var(--sage-deep);margin-bottom:18px">Products</h4>
            <div data-checklist="essentials-products">
            <div class="check-row" data-id="gentle-shamp"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Gentle shampoo</div></div>
            <div class="check-row" data-id="clarifying"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Clarifying shampoo</div></div>
            <div class="check-row" data-id="deep-cond"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Deep conditioner</div></div>
            <div class="check-row" data-id="leave-in"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Water-based leave-in</div></div>
            <div class="check-row" data-id="oil"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Lightweight oil</div></div>
            <div class="check-row" data-id="heat-protect"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Heat protectant</div></div>
            <div class="check-row" data-id="bond-repair"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Bond repair treatment</div></div>
            </div>
        </div>
        </div>
        <div class="card" style="margin-top:24px">
        <h4 style="color:var(--sage-deep);margin-bottom:18px">Non-Negotiable Habits</h4>
        <div class="two-col" style="gap:0 24px" data-checklist="essentials-habits">
            <div>
            <div class="check-row" data-id="silk-sleep"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Sleep on silk or satin</div></div>
            <div class="check-row" data-id="detangle-dry"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Always detangle before washing</div></div>
            <div class="check-row" data-id="warm-water"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Wash with warm, never hot, water</div></div>
            <div class="check-row" data-id="weekly-treat"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Deep condition or mask weekly</div></div>
            </div>
            <div>
            <div class="check-row" data-id="protect-heat"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Always protect from heat</div></div>
            <div class="check-row" data-id="hydration"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Hydrate from the inside (water + nutrients)</div></div>
            <div class="check-row" data-id="dust-ends"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Dust ends every 8–10 weeks</div></div>
            <div class="check-row" data-id="scalp-care"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Treat the scalp like skin</div></div>
            </div>
        </div>
        </div>
    </div>
    </section>

    <section id="sec-know" data-section="know" data-title="Know Your Hair">
    <div class="wrap reveal">
        <span class="page-mark">Page 05 · Your Profile</span>
        <div class="section-head">
        <div class="section-head-row">
            <h2 class="serif">Know Your Hair</h2>
            <div class="sec-chip"><span id="knowChipPct">0%</span><div class="sec-chip-track"><div class="sec-chip-fill" data-sec-chip="know"></div></div></div>
        </div>
        <p class="section-sub">Before you can grow it, you have to understand it. Tap the option that fits you best in each row.</p>
        </div>
        <div class="card" data-profile="know">
        <div class="fld"><span class="fld-label">Texture</span><div class="choice-set" data-choice-group="texture"><button class="choice" data-val="Fine">Fine</button><button class="choice" data-val="Medium">Medium</button><button class="choice" data-val="Coarse">Coarse</button></div></div>
        <div class="fld"><span class="fld-label">Density</span><div class="choice-set" data-choice-group="density"><button class="choice" data-val="Low">Low</button><button class="choice" data-val="Medium">Medium</button><button class="choice" data-val="High">High</button></div></div>
        <div class="fld"><span class="fld-label">Porosity</span><div class="choice-set" data-choice-group="porosity"><button class="choice" data-val="Low">Low</button><button class="choice" data-val="Medium">Medium</button><button class="choice" data-val="High">High</button></div></div>
        <div class="fld"><span class="fld-label">Scalp</span><div class="choice-set" data-choice-group="scalp"><button class="choice" data-val="Dry">Dry</button><button class="choice" data-val="Balanced">Balanced</button><button class="choice" data-val="Oily">Oily</button></div></div>
        <div class="fld" style="margin-bottom:0"><span class="fld-label">Current damage level</span><div class="choice-set" data-choice-group="damage"><button class="choice" data-val="Minimal">Minimal</button><button class="choice" data-val="Moderate">Moderate</button><button class="choice" data-val="Significant">Significant</button></div></div>
        </div>
    </div>
    </section>

    <section id="sec-daily" data-section="daily" data-title="Daily Rituals &amp; Intentions">
    <div class="wrap reveal">
        <span class="page-mark">Page 06 · Daily Practice</span>
        <div class="section-head">
        <div class="section-head-row">
            <h2 class="serif">Haircare Rituals &amp; Intentions</h2>
            <div class="sec-chip" id="dailyChip"><span id="dailyChipCount">0</span> entries</div>
        </div>
        <p class="section-sub">A short daily check-in. Saved by date — come back tomorrow to add another. The more days you log, the stronger your streak.</p>
        </div>
        <div class="card">
        <div class="journal-head">
            <div class="journal-date"><input type="date" id="journalDate"></div>
            <div style="display:flex;gap:8px;align-items:center">
            <button class="dash-menu" id="journalPrev" style="padding:6px 10px">← Prev</button>
            <button class="dash-menu" id="journalNext" style="padding:6px 10px">Next →</button>
            </div>
        </div>
        <div class="fld"><span class="fld-label">My routine for today</span><textarea data-journal="routine" rows="3" placeholder="What will you actually do? E.g. detangle, deep condition, air dry"></textarea></div>
        <div class="two-col">
            <div class="fld"><span class="fld-label">Today's top goal</span><input type="text" data-journal="topGoal" placeholder="One thing for your hair today" /></div>
            <div class="fld"><span class="fld-label">Today's focus</span><input type="text" data-journal="focus" placeholder="One word — patience, gentleness, rhythm…" /></div>
        </div>
        <div class="fld">
            <span class="fld-label">Schedule</span>
            <div class="schedule-list">
            <div class="schedule-row"><input class="time-input" type="text" data-journal="time1" placeholder="6:30a" /><input type="text" data-journal="task1" placeholder="Scalp massage + oil" style="padding:10px 14px;background:var(--cream);border:1px solid var(--line);border-radius:8px"></div>
            <div class="schedule-row"><input class="time-input" type="text" data-journal="time2" placeholder="" /><input type="text" data-journal="task2" placeholder="" style="padding:10px 14px;background:var(--cream);border:1px solid var(--line);border-radius:8px"></div>
            <div class="schedule-row"><input class="time-input" type="text" data-journal="time3" placeholder="" /><input type="text" data-journal="task3" placeholder="" style="padding:10px 14px;background:var(--cream);border:1px solid var(--line);border-radius:8px"></div>
            <div class="schedule-row"><input class="time-input" type="text" data-journal="time4" placeholder="" /><input type="text" data-journal="task4" placeholder="" style="padding:10px 14px;background:var(--cream);border:1px solid var(--line);border-radius:8px"></div>
            </div>
        </div>
        <div class="two-col">
            <div class="fld">
            <span class="fld-label">Water (tap to fill)</span>
            <div class="water-row" id="waterRow">
                <div class="water-cup" data-cup="1"></div><div class="water-cup" data-cup="2"></div><div class="water-cup" data-cup="3"></div><div class="water-cup" data-cup="4"></div><div class="water-cup" data-cup="5"></div><div class="water-cup" data-cup="6"></div><div class="water-cup" data-cup="7"></div><div class="water-cup" data-cup="8"></div>
            </div>
            <p class="fld-hint">8 glasses · <span id="waterCount">0</span> done</p>
            </div>
            <div class="fld">
            <span class="fld-label">Sleep</span>
            <div class="choice-set" data-choice-group="silk">
                <button class="choice" data-val="Yes">Slept on silk · Yes</button>
                <button class="choice" data-val="No">Not tonight</button>
            </div>
            </div>
        </div>
        <div class="fld">
            <span class="fld-label">Mood</span>
            <div class="mood-row" data-mood>
            <button class="mood-btn" data-mood-val="rested">🌿</button>
            <button class="mood-btn" data-mood-val="happy">🌸</button>
            <button class="mood-btn" data-mood-val="okay">☁️</button>
            <button class="mood-btn" data-mood-val="tired">🌙</button>
            <button class="mood-btn" data-mood-val="stressed">⚡</button>
            </div>
        </div>
        <div class="fld" style="margin-bottom:0"><span class="fld-label">Notes</span><textarea data-journal="notes" rows="3" placeholder="How does your hair feel? What did you notice?"></textarea></div>
        </div>
    </div>
    </section>

    <section id="sec-ritual" data-section="ritual" data-title="Hair-Care Self Ritual">
    <div class="wrap reveal">
        <span class="page-mark">Page 07 · Morning + Night</span>
        <div class="section-head">
        <div class="section-head-row">
            <h2 class="serif">The Self Ritual Checklist</h2>
            <div class="sec-chip"><span id="ritualChipPct">0%</span><div class="sec-chip-track"><div class="sec-chip-fill" data-sec-chip="ritual"></div></div></div>
        </div>
        <p class="section-sub">The little rituals that protect length and signal to your body: this matters to me.</p>
        </div>
        <div class="two-col">
        <div class="card">
            <h4 style="color:var(--sage-deep);margin-bottom:18px">Morning Haircare</h4>
            <div data-checklist="ritual-morning">
            <div class="check-row" data-id="m1"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Brush gently with a wide-tooth comb</div></div>
            <div class="check-row" data-id="m2"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Refresh with leave-in spray or lightweight oil</div></div>
            <div class="check-row" data-id="m3"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Massage scalp for 1–2 minutes</div></div>
            <div class="check-row" data-id="m4"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Style low-tension (avoid tight ponytails)</div></div>
            <div class="check-row" data-id="m5"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Heat protectant if styling with heat</div></div>
            <div class="check-row" data-id="m6"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Drink a full glass of water</div></div>
            <div class="check-row" data-id="m7"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Take supplements (if part of your routine)</div></div>
            <div class="check-row" data-id="m8"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">A mindful moment with your hair</div></div>
            <div class="check-row" data-id="m9"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Affirmation: "I'm growing into the woman I'm becoming"</div></div>
            </div>
        </div>
        <div class="card">
            <h4 style="color:var(--sage-deep);margin-bottom:18px">Night Haircare</h4>
            <div data-checklist="ritual-night">
            <div class="check-row" data-id="n1"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Detangle from ends to roots</div></div>
            <div class="check-row" data-id="n2"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Massage scalp with oil (jojoba, rosemary, castor)</div></div>
            <div class="check-row" data-id="n3"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Apply leave-in or overnight serum to ends</div></div>
            <div class="check-row" data-id="n4"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Loose braid, twist, or pineapple</div></div>
            <div class="check-row" data-id="n5"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Silk bonnet or pillowcase</div></div>
            <div class="check-row" data-id="n6"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Hydrate (herbal tea or water)</div></div>
            <div class="check-row" data-id="n7"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Breathwork or short meditation</div></div>
            <div class="check-row" data-id="n8"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Reflect: one thing you did for yourself today</div></div>
            <div class="check-row" data-id="n9"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Lights out by your wind-down time</div></div>
            </div>
        </div>
        </div>
        <div class="note-strip" style="margin-top:24px">
        <div class="note-strip-label">Stylist's tip</div>
        <p>The most important step is the one you'll actually repeat. Pick the three rituals you can do tonight and tomorrow morning — and build from there.</p>
        </div>
    </div>
    </section>

    <section id="sec-growth" data-section="growth" data-title="Growth Routine">
    <div class="wrap reveal">
        <span class="page-mark">Page 08 · The Routine</span>
        <div class="section-head">
        <div class="section-head-row">
            <h2 class="serif">The Growth Routine Checklist</h2>
            <div class="sec-chip"><span id="growthChipPct">0%</span><div class="sec-chip-track"><div class="sec-chip-fill" data-sec-chip="growth"></div></div></div>
        </div>
        <p class="section-sub">Reset · Restore · Repeat · plus the inner work that supports it all.</p>
        </div>
        <div class="two-col">
        <div class="card">
            <h4 style="color:var(--sage-deep);margin-bottom:18px">Reset</h4>
            <div data-checklist="growth-reset">
            <div class="check-row" data-id="r1"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Scalp massage 3–5×</div></div>
            <div class="check-row" data-id="r2"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Clarify build-up 1× this week</div></div>
            <div class="check-row" data-id="r3"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Pre-cleanse oil treatment</div></div>
            <div class="check-row" data-id="r4"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Cleanse with a gentle, sulfate-free shampoo</div></div>
            <div class="check-row" data-id="r5"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Check scalp for tenderness or build-up</div></div>
            </div>
        </div>
        <div class="card">
            <h4 style="color:var(--sage-deep);margin-bottom:18px">Restore</h4>
            <div data-checklist="growth-restore">
            <div class="check-row" data-id="re1"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Deep condition or hair mask</div></div>
            <div class="check-row" data-id="re2"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Bond repair treatment (if damaged)</div></div>
            <div class="check-row" data-id="re3"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Leave-in conditioner on damp hair</div></div>
            <div class="check-row" data-id="re4"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Seal ends with oil or butter</div></div>
            <div class="check-row" data-id="re5"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Air dry whenever possible</div></div>
            </div>
        </div>
        <div class="card">
            <h4 style="color:var(--sage-deep);margin-bottom:18px">Repeat</h4>
            <div data-checklist="growth-repeat">
            <div class="check-row" data-id="rp1"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Wash 1–2× per week</div></div>
            <div class="check-row" data-id="rp2"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Sleep on silk every night</div></div>
            <div class="check-row" data-id="rp3"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Protective style when needed</div></div>
            <div class="check-row" data-id="rp4"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Limit heat to 1× per week or less</div></div>
            <div class="check-row" data-id="rp5"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Dust ends every 8–10 weeks</div></div>
            </div>
        </div>
        <div class="card">
            <h4 style="color:var(--sage-deep);margin-bottom:18px">Inner Wellness</h4>
            <div data-checklist="growth-inner">
            <div class="check-row" data-id="i1"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Protein + leafy greens daily</div></div>
            <div class="check-row" data-id="i2"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Water (½ your body weight in oz)</div></div>
            <div class="check-row" data-id="i3"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">7–9 hours of sleep</div></div>
            <div class="check-row" data-id="i4"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">Movement that you enjoy</div></div>
            <div class="check-row" data-id="i5"><div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></div><div class="check-label">A daily moment of stillness</div></div>
            </div>
        </div>
        </div>
    </div>
    </section>

    <section id="sec-smart" data-section="smart" data-title="SMART Hair Goals">
    <div class="wrap reveal">
        <span class="page-mark">Page 09 · Goal Setting</span>
        <div class="section-head">
        <div class="section-head-row">
            <h2 class="serif">SMART Hair Goals</h2>
            <div class="sec-chip"><span id="smartChipPct">0%</span><div class="sec-chip-track"><div class="sec-chip-fill" data-sec-chip="smart"></div></div></div>
        </div>
        <p class="section-sub">A vague wish slips away. A specific goal — written down — gets done. Fill each prompt with your hair growth goal for the next 12 weeks.</p>
        </div>
        <div class="card">
        <div class="smart-row"><div class="smart-letter">S</div><div class="smart-content"><div class="smart-title">Specific</div><div class="smart-example">e.g. "Grow my hair to mid-back" not "have longer hair"</div><textarea data-smart="specific" rows="2" style="width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;font-family:'Cormorant Garamond',serif;font-size:1.05rem;background:var(--cream)" placeholder="My specific goal is…"></textarea></div></div>
        <div class="smart-row"><div class="smart-letter">M</div><div class="smart-content"><div class="smart-title">Measurable</div><div class="smart-example">e.g. "Two inches in twelve weeks"</div><textarea data-smart="measurable" rows="2" style="width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;font-family:'Cormorant Garamond',serif;font-size:1.05rem;background:var(--cream)" placeholder="How will you measure progress?"></textarea></div></div>
        <div class="smart-row"><div class="smart-letter">A</div><div class="smart-content"><div class="smart-title">Achievable</div><div class="smart-example">Is this realistic given your starting point + commitment?</div><textarea data-smart="achievable" rows="2" style="width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;font-family:'Cormorant Garamond',serif;font-size:1.05rem;background:var(--cream)" placeholder="What makes this achievable for you?"></textarea></div></div>
        <div class="smart-row"><div class="smart-letter">R</div><div class="smart-content"><div class="smart-title">Relevant</div><div class="smart-example">Why does it matter to you right now?</div><textarea data-smart="relevant" rows="2" style="width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;font-family:'Cormorant Garamond',serif;font-size:1.05rem;background:var(--cream)" placeholder="Why is this goal important?"></textarea></div></div>
        <div class="smart-row" style="margin-bottom:0"><div class="smart-letter">T</div><div class="smart-content"><div class="smart-title">Time-bound</div><div class="smart-example">e.g. "By the end of this season"</div><textarea data-smart="timebound" rows="2" style="width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;font-family:'Cormorant Garamond',serif;font-size:1.05rem;background:var(--cream)" placeholder="By when?"></textarea></div></div>
        </div>
    </div>
    </section>

    <section id="sec-matrix" data-section="matrix" data-title="Action Priority Matrix">
    <div class="wrap reveal">
        <span class="page-mark">Page 10 · Priorities</span>
        <div class="section-head">
        <div class="section-head-row">
            <h2 class="serif">The Action Priority Matrix</h2>
            <div class="sec-chip" id="matrixChip"><span id="matrixCount">0</span> items</div>
        </div>
        <p class="section-sub">Sort every action by effort and impact. Drop items in <em>Quick Wins</em> first — they're how momentum starts.</p>
        </div>
        <div class="matrix-wrap">
        <div class="matrix-add">
            <input type="text" id="matrixInput" placeholder="Add an action — e.g. switch to silk pillowcase" />
            <button id="matrixAdd">Add</button>
        </div>
        <div class="matrix-grid" id="matrixGrid">
            <div class="matrix-corner"></div>
            <div class="matrix-axis-x">Low Effort</div>
            <div class="matrix-axis-x">High Effort</div>
            <div class="matrix-axis-y">High Impact</div>
            <div class="matrix-cell" data-cell="quickWins" data-impact="high" data-effort="low"><div class="matrix-cell-title">Quick Wins</div><div class="matrix-cell-hint">Low effort · High impact</div></div>
            <div class="matrix-cell" data-cell="majorProjects" data-impact="high" data-effort="high"><div class="matrix-cell-title">Major Projects</div><div class="matrix-cell-hint">High effort · High impact</div></div>
            <div class="matrix-axis-y">Low Impact</div>
            <div class="matrix-cell" data-cell="fillIns" data-impact="low" data-effort="low"><div class="matrix-cell-title">Fill-Ins</div><div class="matrix-cell-hint">Low effort · Low impact</div></div>
            <div class="matrix-cell" data-cell="thankless" data-impact="low" data-effort="high"><div class="matrix-cell-title">Thankless Tasks</div><div class="matrix-cell-hint">High effort · Low impact</div></div>
        </div>
        <p class="fld-hint" style="margin-top:14px;text-align:center">Drag items between quadrants — or tap an item and a quadrant to move it.</p>
        </div>
    </div>
    </section>

    <section id="sec-wheel" data-section="wheel" data-title="Wheel of Alignment">
    <div class="wrap reveal">
        <span class="page-mark">Page 11 · Whole-Life Check-in</span>
        <div class="section-head">
        <div class="section-head-row">
            <h2 class="serif">The Wheel of Alignment</h2>
            <div class="sec-chip"><span id="wheelChipPct">0%</span><div class="sec-chip-track"><div class="sec-chip-fill" data-sec-chip="wheel"></div></div></div>
        </div>
        <p class="section-sub">Rate each area 1–10. The shape that appears is your <em>real</em> rhythm — and the dips are where new growth wants to come in.</p>
        </div>
        <div class="card">
        <div class="wheel-wrap">
            <svg class="wheel-svg" viewBox="0 0 320 320" id="wheelSvg" aria-hidden="true">
            <g id="wheelRings"></g><g id="wheelSlices"></g><g id="wheelFill"></g><g id="wheelLabels"></g>
            </svg>
            <div class="wheel-controls" id="wheelControls"></div>
        </div>
        <div class="note-strip" style="margin-top:32px"><div class="note-strip-label">Remember</div><p>Healthy hair starts with a healthy life rhythm.</p></div>
        </div>
    </div>
    </section>

    <section id="sec-habits" data-section="habits" data-title="7-Day Habit Tracker">
    <div class="wrap reveal">
        <span class="page-mark">Page 12 · Weekly Cadence</span>
        <div class="section-head">
        <div class="section-head-row">
            <h2 class="serif">The 7-Day Habit Tracker</h2>
            <div class="sec-chip" id="habitChipWrap"><span id="habitTotalDone">0</span> dots filled</div>
        </div>
        <p class="section-sub">Track twelve hair-supporting habits across the week. Every week saves separately so you can watch the pattern build.</p>
        </div>
        <div class="card">
        <div class="tracker-head">
            <div class="week-nav"><button id="habitPrev">←</button><span id="habitWeekLabel">Week of —</span><button id="habitNext">→</button></div>
            <div><span class="week-streak"><span id="habitStreakNum">0</span> day streak</span></div>
        </div>
        <div style="overflow-x:auto">
            <table class="habit-table">
            <thead><tr><th>Habit</th><th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th></tr></thead>
            <tbody id="habitTableBody"></tbody>
            </table>
        </div>
        <div class="fld" style="margin-top:24px"><span class="fld-label">Reflection — what worked this week?</span><textarea data-habit-reflect rows="3" placeholder="Notes for this week…"></textarea></div>
        </div>
    </div>
    </section>

    <section id="sec-life" data-section="life" data-title="Aligned Life Goals">
    <div class="wrap reveal">
        <span class="page-mark">Page 13 · Whole-Life Goals</span>
        <div class="section-head">
        <div class="section-head-row">
            <h2 class="serif">Aligned Life Goals</h2>
            <div class="sec-chip"><span id="lifeChipPct">0%</span><div class="sec-chip-track"><div class="sec-chip-fill" data-sec-chip="life"></div></div></div>
        </div>
        <p class="section-sub">Your hair grows alongside the rest of you. Write one goal for each area, the action that gets you there, and the support you'll need.</p>
        </div>
        <div class="life-table">
        <div class="life-row" data-life="family"><div class="life-row-title">Family &amp; Connection</div><textarea data-life-field="goal" rows="2" placeholder="My goal…"></textarea><label>Action</label><textarea data-life-field="action" rows="1" placeholder="What I'll do this month"></textarea><label>Support</label><textarea data-life-field="support" rows="1" placeholder="Who or what helps me"></textarea></div>
        <div class="life-row" data-life="friends"><div class="life-row-title">Friendships</div><textarea data-life-field="goal" rows="2" placeholder="My goal…"></textarea><label>Action</label><textarea data-life-field="action" rows="1" placeholder="What I'll do this month"></textarea><label>Support</label><textarea data-life-field="support" rows="1" placeholder="Who or what helps me"></textarea></div>
        <div class="life-row" data-life="career"><div class="life-row-title">Career &amp; Creativity</div><textarea data-life-field="goal" rows="2" placeholder="My goal…"></textarea><label>Action</label><textarea data-life-field="action" rows="1" placeholder="What I'll do this month"></textarea><label>Support</label><textarea data-life-field="support" rows="1" placeholder="Who or what helps me"></textarea></div>
        <div class="life-row" data-life="body"><div class="life-row-title">Body &amp; Health</div><textarea data-life-field="goal" rows="2" placeholder="My goal…"></textarea><label>Action</label><textarea data-life-field="action" rows="1" placeholder="What I'll do this month"></textarea><label>Support</label><textarea data-life-field="support" rows="1" placeholder="Who or what helps me"></textarea></div>
        <div class="life-row" data-life="mental"><div class="life-row-title">Mental Wellness</div><textarea data-life-field="goal" rows="2" placeholder="My goal…"></textarea><label>Action</label><textarea data-life-field="action" rows="1" placeholder="What I'll do this month"></textarea><label>Support</label><textarea data-life-field="support" rows="1" placeholder="Who or what helps me"></textarea></div>
        <div class="life-row" data-life="faith"><div class="life-row-title">Faith / Spirituality</div><textarea data-life-field="goal" rows="2" placeholder="My goal…"></textarea><label>Action</label><textarea data-life-field="action" rows="1" placeholder="What I'll do this month"></textarea><label>Support</label><textarea data-life-field="support" rows="1" placeholder="Who or what helps me"></textarea></div>
        </div>
    </div>
    </section>

    <section id="sec-weekly" data-section="weekly" data-title="Weekly Growth Tracker">
    <div class="wrap reveal">
        <span class="page-mark">Page 14 · Week in Review</span>
        <div class="section-head">
        <div class="section-head-row">
            <h2 class="serif">The Weekly Growth Tracker</h2>
            <div class="sec-chip"><span id="weeklyChipPct">0%</span><div class="sec-chip-track"><div class="sec-chip-fill" data-sec-chip="weekly"></div></div></div>
        </div>
        <p class="section-sub">Each day this week — what was the goal, what came up, did you do it?</p>
        </div>
        <div class="card">
        <div class="tracker-head">
            <div class="week-nav"><button id="weeklyPrev">←</button><span id="weeklyLabel">Week of —</span><button id="weeklyNext">→</button></div>
        </div>
        <div id="weeklyBody"></div>
        </div>
    </div>
    </section>

    <section id="sec-why" data-section="why" data-title="Understanding Your Why">
    <div class="wrap reveal">
        <span class="page-mark">Page 15 · The 5 Whys</span>
        <div class="section-head">
        <div class="section-head-row">
            <h2 class="serif">Understanding Your Why</h2>
            <div class="sec-chip"><span id="whyChipPct">0%</span><div class="sec-chip-track"><div class="sec-chip-fill" data-sec-chip="why"></div></div></div>
        </div>
        <p class="section-sub">When motivation dips — and it will — your <em>why</em> is what brings you back. Move down through these five layers slowly.</p>
        </div>
        <div class="why-step"><div class="why-num">01</div><div class="fld-label">My goal</div><div class="why-prompt">What is the goal you want to achieve?</div><textarea data-why="goal" rows="2" style="width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;font-family:'Cormorant Garamond',serif;font-size:1.05rem;background:var(--cream)"></textarea></div>
        <div class="why-step"><div class="why-num">02</div><div class="fld-label">Why 1</div><div class="why-prompt">And what will achieving that give you?</div><textarea data-why="w1" rows="2" style="width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;font-family:'Cormorant Garamond',serif;font-size:1.05rem;background:var(--cream)"></textarea></div>
        <div class="why-step"><div class="why-num">03</div><div class="fld-label">Why 2</div><div class="why-prompt">And what will that give you?</div><textarea data-why="w2" rows="2" style="width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;font-family:'Cormorant Garamond',serif;font-size:1.05rem;background:var(--cream)"></textarea></div>
        <div class="why-step"><div class="why-num">04</div><div class="fld-label">Why 3</div><div class="why-prompt">And what will that give you?</div><textarea data-why="w3" rows="2" style="width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;font-family:'Cormorant Garamond',serif;font-size:1.05rem;background:var(--cream)"></textarea></div>
        <div class="why-step"><div class="why-num">05</div><div class="fld-label">Why 4</div><div class="why-prompt">And what will that give you?</div><textarea data-why="w4" rows="2" style="width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;font-family:'Cormorant Garamond',serif;font-size:1.05rem;background:var(--cream)"></textarea></div>
        <div class="why-step" style="border-left-color:var(--ink);background:var(--paper)"><div class="why-num" style="color:var(--ink);opacity:0.7">★</div><div class="fld-label" style="color:var(--ink)">My real why</div><div class="why-prompt">So why is this goal important to me?</div><textarea data-why="real" rows="3" style="width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-style:italic;background:var(--cream)"></textarea></div>
    </div>
    </section>

    <section id="sec-close" data-section="close" data-title="A Note from Lauren">
    <div class="wrap reveal">
        <span class="page-mark">Page 16 · A Note from Lauren</span>
        <div class="divider"></div>
        <h2 class="serif" style="font-style:italic;font-weight:300">A note from Lauren</h2>
        <div class="letter">
        <p>If you've made it this far — even if your pages are messy, half-filled, with skipped weeks and re-starts — you've already done the part most people don't. You showed up. You looked at the small habits that grow hair, and you got honest about which ones you actually do.</p>
        <p>That is the work. Not the perfect routine. Not the longest length. The work is the rhythm — gentle, repeatable, real — that you build with yourself.</p>
        <p>Come back to this journal whenever you forget. Re-read your <em>why</em>. Sit with your wheel. Fill in another week. Hair is a slow project; you've got time.</p>
        </div>
        <div class="note-strip" style="margin:32px 0"><div class="note-strip-label">Carry it forward</div><p>"Every time you show up for your hair, you're really showing up for you."</p></div>
        <div class="signature">With love, Lauren<small>The Hair Insider · thehairinsider.com</small></div>
        <div class="cta">
        <span style="font-size:0.7rem;letter-spacing:0.22em;text-transform:uppercase;opacity:0.85;font-weight:500">Ready for the full method</span>
        <h3>Build your 21-day rhythm.</h3>
        <p>How To Grow Your Hair is the full course this workbook companions — every wash day mapped, every product paired to your profile, every habit reinforced.</p>
        <a href="#" class="cta-btn" id="ctaBtn">Join the course</a>
        </div>
    </div>
    </section>

    </main>

    <footer class="foot">
    <p>© The Hair Insider · thehairinsider.com</p>
    <p style="opacity:0.6;margin:0">Your entries save automatically on this device.</p>
    </footer>
`;

export default function WorkbookClient() {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;
        const cleanup = initWorkbook();
        return cleanup;
    }, []);

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
                href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap'
                rel='stylesheet'
            />
            <style dangerouslySetInnerHTML={{ __html: CSS }} />
            <div
                id='workbook-root'
                dangerouslySetInnerHTML={{ __html: HTML }}
            />
        </>
    );
}
