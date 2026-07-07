"use client";

import { useEffect, useRef } from "react";
import { initGrowthEdit } from "./growthEditInit";

const CSS = `
:root{
  --sage:#b8bca7;
  --sage-deep:#8f9379;
  --sage-soft:#cdd1bd;
  --paper:#ebe5d8;
  --cream:#f3eee5;
  --cream-deep:#e9e2d1;
  --blue:#d4dde3;
  --ink:#1a1a1a;
  --mute:#6e6e6e;
  --line:rgba(26,26,26,0.12);
  --line-soft:rgba(26,26,26,0.07);
  --shadow:0 10px 40px -20px rgba(26,26,26,0.28);
  --shadow-soft:0 4px 24px -14px rgba(26,26,26,0.2);
  --shadow-lift:0 24px 70px -30px rgba(26,26,26,0.4);
}
#growth-edit-root *, #growth-edit-root *::before, #growth-edit-root *::after{box-sizing:border-box}
#growth-edit-root html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
#growth-edit-root body{
  margin:0;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
  font-weight:400;
  color:var(--ink);
  background:var(--cream);
  line-height:1.6;
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
}
#growth-edit-root img{max-width:100%;display:block}
#growth-edit-root button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
#growth-edit-root a{color:inherit}
#growth-edit-root .serif{font-family:'Cormorant Garamond',Georgia,serif}
#growth-edit-root h1, #growth-edit-root h2, #growth-edit-root h3{font-family:'Cormorant Garamond',Georgia,serif;font-weight:400;letter-spacing:-0.01em;margin:0 0 0.4em}
#growth-edit-root h1{font-size:clamp(2.6rem,7vw,4.6rem);line-height:1.04}
#growth-edit-root h2{font-size:clamp(2rem,4.6vw,3.1rem);line-height:1.1}
#growth-edit-root h3{font-size:clamp(1.4rem,3vw,1.85rem);line-height:1.2}
#growth-edit-root p{margin:0 0 1em}
#growth-edit-root .eyebrow{
  font-family:'Inter',sans-serif;font-size:0.72rem;font-weight:600;
  letter-spacing:0.28em;text-transform:uppercase;color:var(--sage-deep);
}
#growth-edit-root .eyebrow.light{color:rgba(243,238,229,0.85)}
#growth-edit-root .quote{font-family:'Cormorant Garamond',serif;font-style:italic}
#growth-edit-root .divider{width:64px;height:1px;background:var(--sage-deep);opacity:0.6;margin:0 0 26px}
#growth-edit-root .divider.center{margin-left:auto;margin-right:auto}
#growth-edit-root .divider.light{background:rgba(243,238,229,0.7);opacity:0.9}
#growth-edit-root .wrap{max-width:1080px;margin:0 auto;padding:0 24px}
#growth-edit-root .wrap-tight{max-width:780px;margin:0 auto;padding:0 24px}
#growth-edit-root section{position:relative}
#growth-edit-root .topbar{
  position:sticky;top:0;z-index:80;
  background:rgba(243,238,229,0.86);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  border-bottom:1px solid var(--line-soft);
}
#growth-edit-root .topbar-inner{
  max-width:1080px;margin:0 auto;padding:13px 24px;
  display:flex;align-items:center;justify-content:space-between;gap:16px;
}
#growth-edit-root .topbar-brand{
  font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;
  font-size:1.18rem;letter-spacing:0.01em;line-height:1;
}
#growth-edit-root .topbar-brand small{
  display:block;font-family:'Inter',sans-serif;font-style:normal;font-weight:600;
  font-size:0.56rem;letter-spacing:0.32em;text-transform:uppercase;
  color:var(--sage-deep);margin-top:5px;
}
#growth-edit-root .list-btn{
  display:flex;align-items:center;gap:9px;
  padding:9px 17px;border-radius:999px;
  border:1px solid var(--line);background:var(--cream);
  font-size:0.7rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;
  transition:all .25s ease;white-space:nowrap;
}
#growth-edit-root .list-btn:hover{background:var(--ink);color:var(--cream);border-color:var(--ink)}
#growth-edit-root .list-btn .count{
  display:inline-flex;align-items:center;justify-content:center;
  min-width:20px;height:20px;padding:0 6px;border-radius:999px;
  background:var(--sage-deep);color:var(--cream);font-size:0.66rem;font-weight:700;
  letter-spacing:0;
}
#growth-edit-root .list-btn:hover .count{background:var(--cream);color:var(--ink)}
#growth-edit-root .hero{
  background:linear-gradient(180deg,var(--sage-soft) 0%,var(--sage) 56%,var(--sage-deep) 100%);
  color:var(--cream);text-align:center;position:relative;overflow:hidden;
  padding:clamp(80px,13vw,140px) 24px clamp(90px,12vw,130px);
}
#growth-edit-root .hero::before{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:
    radial-gradient(circle at 28% 20%,rgba(243,238,229,0.2),transparent 52%),
    radial-gradient(circle at 74% 84%,rgba(243,238,229,0.13),transparent 55%);
}
#growth-edit-root .hero-inner{position:relative;max-width:760px;margin:0 auto}
#growth-edit-root .hero-mark{
  font-size:0.74rem;letter-spacing:0.42em;font-weight:500;text-transform:uppercase;
  opacity:0.88;margin-bottom:38px;
}
#growth-edit-root .hero h1{
  font-style:italic;font-weight:300;
  font-size:clamp(2.8rem,8.5vw,5.4rem);margin-bottom:0.28em;color:var(--cream);
}
#growth-edit-root .hero-sub{
  font-family:'Cormorant Garamond',serif;font-style:italic;
  font-size:clamp(1.15rem,2.6vw,1.6rem);opacity:0.96;max-width:30ch;margin:0 auto 14px;
}
#growth-edit-root .hero-note{
  font-family:'Inter',sans-serif;font-size:0.82rem;line-height:1.6;
  opacity:0.82;max-width:42ch;margin:0 auto 44px;font-weight:400;letter-spacing:0.01em;
}
#growth-edit-root .hero-cta{
  display:inline-flex;align-items:center;gap:11px;
  padding:15px 30px;border-radius:999px;
  background:var(--cream);color:var(--ink);
  font-family:'Inter',sans-serif;font-size:0.74rem;font-weight:600;
  letter-spacing:0.16em;text-transform:uppercase;
  transition:transform .25s ease, box-shadow .25s ease;box-shadow:var(--shadow-soft);
}
#growth-edit-root .hero-cta:hover{transform:translateY(-2px);box-shadow:var(--shadow)}
#growth-edit-root .hero-cta .arrow{transition:transform .25s ease}
#growth-edit-root .hero-cta:hover .arrow{transform:translateY(3px)}
#growth-edit-root .hero-meta{
  display:flex;gap:14px;justify-content:center;flex-wrap:wrap;align-items:center;
  font-size:0.68rem;letter-spacing:0.28em;text-transform:uppercase;font-weight:500;
  margin-top:46px;opacity:0.82;
}
#growth-edit-root .hero-meta span:not(:last-child)::after{content:"·";margin-left:14px;opacity:0.6}
#growth-edit-root .sec{padding:clamp(64px,9vw,108px) 0}
#growth-edit-root .sec.paper{background:var(--paper)}
#growth-edit-root .sec-head{text-align:center;max-width:620px;margin:0 auto clamp(40px,6vw,64px)}
#growth-edit-root .sec-head .eyebrow{margin-bottom:18px;display:block}
#growth-edit-root .sec-head p{color:var(--mute);font-size:1.02rem}
#growth-edit-root .finder-step{margin-bottom:46px}
#growth-edit-root .finder-step-label{
  display:flex;align-items:baseline;gap:12px;margin-bottom:20px;justify-content:center;
}
#growth-edit-root .finder-step-num{
  font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.3rem;color:var(--sage-deep);
}
#growth-edit-root .finder-step-title{
  font-size:0.72rem;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;
}
#growth-edit-root .finder-opt{
  font-style:normal;font-weight:500;letter-spacing:0.04em;text-transform:none;
  color:var(--sage-deep);font-size:0.82rem;
}
#growth-edit-root .finder-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:760px;margin:0 auto;
}
#growth-edit-root .finder-grid.four{grid-template-columns:repeat(4,1fr);max-width:760px}
#growth-edit-root .chip{
  text-align:left;padding:22px 22px 20px;border-radius:16px;
  border:1px solid var(--line);background:var(--cream);
  transition:all .22s ease;position:relative;
}
#growth-edit-root .sec.paper .chip{background:var(--cream)}
#growth-edit-root .chip:hover{border-color:var(--sage-deep);transform:translateY(-2px);box-shadow:var(--shadow-soft)}
#growth-edit-root .chip.active{
  border-color:var(--ink);background:var(--ink);color:var(--cream);
  box-shadow:var(--shadow);
}
#growth-edit-root .chip-name{
  font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:500;
  line-height:1;margin-bottom:8px;
}
#growth-edit-root .chip.active .chip-name{color:var(--cream)}
#growth-edit-root .chip-desc{font-size:0.78rem;line-height:1.45;color:var(--mute)}
#growth-edit-root .chip.active .chip-desc{color:rgba(243,238,229,0.82)}
#growth-edit-root .chip-tick{
  position:absolute;top:16px;right:16px;width:18px;height:18px;border-radius:50%;
  border:1px solid var(--line);display:flex;align-items:center;justify-content:center;
  font-size:11px;opacity:0;transition:opacity .2s ease;
}
#growth-edit-root .chip.active .chip-tick{opacity:1;border-color:var(--cream);background:var(--cream);color:var(--ink)}
#growth-edit-root .finder-help{text-align:center;margin-top:8px}
#growth-edit-root .finder-help summary{
  list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px;
  font-size:0.72rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;
  color:var(--sage-deep);padding:8px 4px;
}
#growth-edit-root .finder-help summary::-webkit-details-marker{display:none}
#growth-edit-root .finder-help summary .ic{transition:transform .2s ease}
#growth-edit-root .finder-help[open] summary .ic{transform:rotate(45deg)}
#growth-edit-root .finder-help-body{
  max-width:620px;margin:14px auto 0;text-align:left;
  background:var(--cream);border:1px solid var(--line-soft);border-radius:14px;padding:22px 26px;
  font-size:0.88rem;color:var(--mute);
}
#growth-edit-root .finder-help-body strong{color:var(--ink);font-weight:600}
#growth-edit-root .finder-help-body p{margin-bottom:0.7em}
#growth-edit-root .finder-help-body p:last-child{margin-bottom:0}
#growth-edit-root .generate-wrap{text-align:center;margin-top:clamp(40px,6vw,64px)}
#growth-edit-root .generate-btn{
  display:inline-flex;align-items:center;gap:13px;
  padding:18px 42px;border-radius:999px;
  background:var(--ink);color:var(--cream);
  font-family:'Inter',sans-serif;font-size:0.78rem;font-weight:600;
  letter-spacing:0.18em;text-transform:uppercase;
  transition:transform .25s ease,box-shadow .25s ease,opacity .25s ease,background .25s ease;
  box-shadow:var(--shadow-soft);
}
#growth-edit-root .generate-btn:not(:disabled):hover{transform:translateY(-2px);box-shadow:var(--shadow)}
#growth-edit-root .generate-btn:disabled{opacity:0.32;cursor:not-allowed}
#growth-edit-root .generate-btn.ready{
  background:linear-gradient(120deg,var(--sage-deep) 0%,var(--ink) 100%);
}
#growth-edit-root .generate-arrow{transition:transform .25s ease;display:inline-block}
#growth-edit-root .generate-btn:not(:disabled):hover .generate-arrow{transform:translateY(3px)}
#growth-edit-root .generate-btn.is-generating{pointer-events:none}
#growth-edit-root .generate-btn.is-generating .generate-arrow{
  width:15px;height:15px;border:2px solid rgba(243,238,229,0.4);border-top-color:var(--cream);
  border-radius:50%;animation:gen-spin .7s linear infinite;transform:none;
}
@keyframes gen-spin{to{transform:rotate(360deg)}}
#growth-edit-root .generate-hint{
  margin:18px auto 0;font-size:0.8rem;color:var(--mute);max-width:36ch;line-height:1.5;
  transition:opacity .25s ease;
}
#growth-edit-root .result-loading{text-align:center;padding:clamp(50px,8vw,90px) 20px}
#growth-edit-root .result-loading .loader-ring{
  width:46px;height:46px;margin:0 auto 26px;border-radius:50%;
  border:2px solid var(--line);border-top-color:var(--sage-deep);
  animation:gen-spin .8s linear infinite;
}
#growth-edit-root .result-loading .loader-text{
  font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1.4rem,3vw,1.9rem);
  color:var(--ink);margin-bottom:10px;
}
#growth-edit-root .result-loading .loader-sub{
  font-size:0.78rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--sage-deep);
  font-weight:600;min-height:1.2em;
}
#growth-edit-root .result{
  scroll-margin-top:90px;
}
#growth-edit-root .result-banner{
  background:linear-gradient(135deg,var(--sage) 0%,var(--sage-deep) 100%);
  color:var(--cream);border-radius:24px;padding:clamp(34px,5vw,52px);
  text-align:center;position:relative;overflow:hidden;box-shadow:var(--shadow);
}
#growth-edit-root .result-banner::before{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(circle at 24% 22%,rgba(243,238,229,0.18),transparent 55%);
}
#growth-edit-root .result-banner .eyebrow{margin-bottom:16px;display:block}
#growth-edit-root .result-name{
  font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;
  font-size:clamp(2.2rem,5.4vw,3.4rem);line-height:1.06;margin-bottom:0.3em;color:var(--cream);
}
#growth-edit-root .result-blurb{
  max-width:50ch;margin:0 auto 22px;font-size:0.98rem;line-height:1.65;
  opacity:0.94;position:relative;
}
#growth-edit-root .result-traits{
  display:flex;gap:9px;justify-content:center;flex-wrap:wrap;position:relative;
}
#growth-edit-root .trait{
  font-family:'Inter',sans-serif;font-size:0.64rem;font-weight:600;letter-spacing:0.14em;
  text-transform:uppercase;padding:7px 14px;border-radius:999px;
  background:rgba(243,238,229,0.16);border:1px solid rgba(243,238,229,0.32);
}
#growth-edit-root .result-empty{
  text-align:center;color:var(--mute);font-family:'Cormorant Garamond',serif;
  font-style:italic;font-size:1.4rem;padding:40px 0;
}
#growth-edit-root .foundation{
  background:linear-gradient(135deg,var(--cream) 0%,var(--cream-deep) 100%);
  border:1px solid var(--sage);border-radius:22px;overflow:hidden;
  box-shadow:var(--shadow-soft);margin-top:clamp(36px,5vw,56px);position:relative;
}
#growth-edit-root .foundation-badge{
  display:inline-block;white-space:nowrap;
  font-size:0.62rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;
  color:var(--cream);background:var(--sage-deep);padding:9px clamp(22px,3vw,32px);
  border-bottom-right-radius:14px;
}
#growth-edit-root .foundation-intro{
  padding:clamp(22px,3.4vw,34px) clamp(24px,3.4vw,40px) clamp(6px,1vw,10px);
  max-width:760px;
}
#growth-edit-root .foundation-name{font-size:1.9rem;font-weight:500;line-height:1.05;margin:4px 0 6px}
#growth-edit-root .foundation-tag{font-size:1.05rem;color:var(--sage-deep);margin-bottom:14px;display:block}
#growth-edit-root .foundation-why{font-size:0.92rem;line-height:1.6;color:var(--ink);margin:0}
#growth-edit-root .foundation-options{
  display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line-soft);
  border-top:1px solid var(--line-soft);margin-top:clamp(20px,2.6vw,28px);
}
#growth-edit-root .foundation-opt{
  background:var(--cream);padding:clamp(20px,2.6vw,28px);display:flex;flex-direction:column;
}
#growth-edit-root .foundation-opt-img{width:100%;height:auto;aspect-ratio:4/3;display:block;margin-bottom:16px}
#growth-edit-root .foundation-opt-name{font-size:1.3rem;font-weight:500;line-height:1.16;margin:5px 0 8px}
#growth-edit-root .foundation-opt-why{font-size:0.86rem;line-height:1.55;color:var(--ink);margin-bottom:14px}
#growth-edit-root .foundation .pick-more{margin-top:auto}
@media (max-width:680px){
#growth-edit-root .foundation-options{grid-template-columns:1fr}
}
#growth-edit-root .shelf{display:flex;flex-direction:column;gap:20px;margin-top:clamp(36px,5vw,56px)}
#growth-edit-root .cat{
  background:var(--cream);border:1px solid var(--line-soft);border-radius:20px;
  overflow:hidden;box-shadow:var(--shadow-soft);
}
#growth-edit-root .sec.paper .cat{background:var(--cream)}
#growth-edit-root .cat-head{
  display:flex;align-items:center;gap:16px;padding:22px clamp(22px,3vw,32px);
  border-bottom:1px solid var(--line-soft);
}
#growth-edit-root .cat-step{
  font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.5rem;
  color:var(--sage-deep);min-width:34px;
}
#growth-edit-root .cat-titles{flex:1;min-width:0}
#growth-edit-root .cat-name{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:500;line-height:1.05}
#growth-edit-root .cat-why{font-size:0.85rem;color:var(--mute);line-height:1.5;margin-top:3px}
#growth-edit-root .cat-cadence{
  font-size:0.62rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;
  color:var(--sage-deep);white-space:nowrap;text-align:right;line-height:1.4;
}
#growth-edit-root .cat-cadence span{display:block;color:var(--mute);font-weight:500}
#growth-edit-root .disclaimer{
  display:flex;gap:14px;align-items:flex-start;
  padding:18px clamp(22px,3vw,32px);
  background:rgba(168,118,106,0.1);
  border-top:1px solid rgba(168,118,106,0.25);
  border-bottom:1px solid rgba(168,118,106,0.25);
}
#growth-edit-root .disclaimer-icon{
  flex:0 0 auto;width:26px;height:26px;border-radius:50%;
  background:#a8766a;color:var(--cream);display:flex;align-items:center;justify-content:center;
  font-family:'Cormorant Garamond',serif;font-weight:700;font-size:1.05rem;line-height:1;
}
#growth-edit-root .disclaimer-title{
  font-size:0.64rem;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;
  color:#9c6253;margin-bottom:5px;
}
#growth-edit-root .disclaimer p{font-size:0.8rem;line-height:1.55;color:var(--mute);margin:0}
#growth-edit-root .disclaimer strong{color:var(--ink);font-weight:600}
#growth-edit-root .picks{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line-soft)}
#growth-edit-root .pick{background:var(--cream);padding:clamp(20px,2.6vw,28px);display:flex;flex-direction:column}
#growth-edit-root .pick-tier{
  display:inline-flex;align-items:center;gap:7px;align-self:flex-start;
  font-size:0.6rem;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;
  padding:5px 11px;border-radius:999px;margin-bottom:16px;white-space:nowrap;
}
#growth-edit-root .pick-tier.pro{background:var(--ink);color:var(--cream)}
#growth-edit-root .pick-tier.alt{background:var(--blue);color:var(--ink)}
#growth-edit-root .pick-img{
  width:100%;aspect-ratio:4/5;border-radius:12px;margin-bottom:16px;
  background:
    repeating-linear-gradient(135deg,var(--cream-deep) 0 9px,var(--paper) 9px 18px);
  border:1px solid var(--line-soft);
  display:flex;align-items:flex-end;justify-content:center;padding:12px;position:relative;
}
#growth-edit-root .pick-img-slot{
  width:100%;height:auto;aspect-ratio:4/5;margin-bottom:16px;display:block;
}
#growth-edit-root .pick-img span{
  font-family:'Inter',sans-serif;font-size:0.58rem;font-weight:600;letter-spacing:0.14em;
  text-transform:uppercase;color:var(--mute);background:rgba(243,238,229,0.78);
  padding:5px 9px;border-radius:6px;text-align:center;
}
#growth-edit-root .pick-brand{
  font-size:0.62rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;
  color:var(--sage-deep);margin-bottom:5px;
}
#growth-edit-root .pick-name{
  font-family:'Cormorant Garamond',serif;font-size:1.32rem;font-weight:500;line-height:1.16;
  margin-bottom:8px;
}
#growth-edit-root .pick-price{
  font-size:0.82rem;color:var(--ink);font-weight:500;margin-bottom:13px;
  display:flex;align-items:center;gap:10px;flex-wrap:wrap;
}
#growth-edit-root .pick-repurchase{
  font-size:0.6rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;
  color:var(--sage-deep);background:rgba(143,147,121,0.12);padding:3px 9px;border-radius:999px;
}
#growth-edit-root .pick-why{font-size:0.86rem;line-height:1.55;color:var(--ink);margin-bottom:14px}
#growth-edit-root .pick-more{
  border-top:1px solid var(--line-soft);margin-top:auto;
}
#growth-edit-root .pick-more summary{
  list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;
  padding:13px 0 4px;font-size:0.66rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;
  color:var(--sage-deep);
}
#growth-edit-root .pick-more summary::-webkit-details-marker{display:none}
#growth-edit-root .pick-more summary .ic{transition:transform .2s ease;font-size:1rem}
#growth-edit-root .pick-more[open] summary .ic{transform:rotate(45deg)}
#growth-edit-root .detail{padding:6px 0 4px}
#growth-edit-root .detail-row{margin-bottom:13px}
#growth-edit-root .detail-row:last-child{margin-bottom:6px}
#growth-edit-root .detail-label{
  font-size:0.6rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;
  color:var(--sage-deep);margin-bottom:4px;display:flex;align-items:center;gap:7px;
}
#growth-edit-root .detail-label::before{content:"";width:5px;height:5px;border-radius:50%;background:var(--sage-deep)}
#growth-edit-root .detail-row.avoid .detail-label{color:#a8766a}
#growth-edit-root .detail-row.avoid .detail-label::before{background:#a8766a}
#growth-edit-root .detail-text{font-size:0.84rem;line-height:1.55;color:var(--mute)}
#growth-edit-root .pick-actions{display:flex;gap:9px;margin-top:16px;flex-wrap:wrap}
#growth-edit-root .shop-btn{
  flex:1;min-width:120px;text-align:center;padding:12px 16px;border-radius:999px;
  background:var(--ink);color:var(--cream);font-size:0.68rem;font-weight:600;
  letter-spacing:0.13em;text-transform:uppercase;transition:opacity .2s ease;
  text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:7px;
}
#growth-edit-root .shop-btn:hover{opacity:0.85}
#growth-edit-root .shop-btn.alt{background:var(--cream);color:var(--ink);border:1px solid var(--line)}
#growth-edit-root .shop-btn.alt:hover{background:var(--paper)}
#growth-edit-root .save-btn{
  width:44px;height:44px;flex:0 0 auto;border-radius:50%;border:1px solid var(--line);
  background:var(--cream);display:flex;align-items:center;justify-content:center;
  transition:all .2s ease;font-size:1rem;
}
#growth-edit-root .save-btn:hover{border-color:var(--sage-deep)}
#growth-edit-root .save-btn.saved{background:var(--sage-deep);border-color:var(--sage-deep);color:var(--cream)}
#growth-edit-root .layer-cols{display:grid;grid-template-columns:1fr 1fr;gap:18px}
#growth-edit-root .layer-card{
  background:var(--cream);border:1px solid var(--line-soft);border-radius:20px;
  padding:clamp(26px,3.4vw,38px);box-shadow:var(--shadow-soft);
}
#growth-edit-root .layer-card h3{margin-bottom:4px}
#growth-edit-root .layer-card .eyebrow{display:block;margin-bottom:18px}
#growth-edit-root .layer-step{
  display:flex;gap:16px;padding:15px 0;border-top:1px solid var(--line-soft);
}
#growth-edit-root .layer-step:first-of-type{border-top:none;padding-top:4px}
#growth-edit-root .layer-num{
  font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.25rem;
  color:var(--sage-deep);min-width:26px;line-height:1.3;
}
#growth-edit-root .layer-step-name{font-weight:600;font-size:0.92rem;margin-bottom:2px}
#growth-edit-root .layer-step-text{font-size:0.84rem;color:var(--mute);line-height:1.5}
#growth-edit-root .scrim{
  position:fixed;inset:0;background:rgba(26,26,26,0.4);z-index:90;
  opacity:0;visibility:hidden;transition:opacity .3s ease,visibility .3s ease;
  backdrop-filter:blur(2px);
}
#growth-edit-root .scrim.open{opacity:1;visibility:visible}
#growth-edit-root .drawer{
  position:fixed;top:0;right:0;height:100%;width:min(420px,90vw);z-index:95;
  background:var(--cream);box-shadow:-30px 0 70px -40px rgba(26,26,26,0.5);
  transform:translateX(100%);transition:transform .36s cubic-bezier(.4,0,.2,1);
  display:flex;flex-direction:column;
}
#growth-edit-root .drawer.open{transform:translateX(0)}
#growth-edit-root .drawer-head{
  padding:24px 26px 18px;border-bottom:1px solid var(--line-soft);
  display:flex;align-items:flex-start;justify-content:space-between;gap:12px;
}
#growth-edit-root .drawer-head h3{margin:0 0 3px}
#growth-edit-root .drawer-head p{margin:0;font-size:0.76rem;color:var(--mute)}
#growth-edit-root .drawer-close{font-size:1.5rem;line-height:1;color:var(--mute);padding:2px 6px}
#growth-edit-root .drawer-close:hover{color:var(--ink)}
#growth-edit-root .drawer-body{flex:1;overflow-y:auto;padding:18px 26px 0}
#growth-edit-root .drawer-empty{text-align:center;color:var(--mute);padding:60px 20px}
#growth-edit-root .drawer-empty .serif{font-style:italic;font-size:1.4rem;color:var(--ink);display:block;margin-bottom:8px}
#growth-edit-root .li{
  display:flex;gap:13px;padding:15px 0;border-bottom:1px solid var(--line-soft);align-items:flex-start;
}
#growth-edit-root .li-img{
  width:46px;height:58px;border-radius:8px;flex:0 0 auto;
  background:repeating-linear-gradient(135deg,var(--cream-deep) 0 7px,var(--paper) 7px 14px);
  border:1px solid var(--line-soft);
  overflow:hidden;
}
#growth-edit-root .li-img img{width:100%;height:100%;object-fit:cover;display:block;border-radius:8px;}
#growth-edit-root .li-main{flex:1;min-width:0}
#growth-edit-root .li-brand{font-size:0.58rem;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:var(--sage-deep)}
#growth-edit-root .li-name{font-family:'Cormorant Garamond',serif;font-size:1.08rem;font-weight:500;line-height:1.2;margin:1px 0 3px}
#growth-edit-root .li-meta{font-size:0.7rem;color:var(--mute);display:flex;gap:8px;flex-wrap:wrap;align-items:center}
#growth-edit-root .li-cadence{color:var(--sage-deep);font-weight:600;letter-spacing:0.06em;text-transform:uppercase;font-size:0.58rem}
#growth-edit-root .li-links{display:flex;gap:8px;margin-top:7px}
#growth-edit-root .li-shop{font-size:0.64rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink);border-bottom:1px solid var(--sage-deep);padding-bottom:1px}
#growth-edit-root .li-remove{font-size:0.64rem;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:var(--mute)}
#growth-edit-root .li-remove:hover{color:#a8766a}
#growth-edit-root .drawer-foot{
  padding:18px 26px;border-top:1px solid var(--line-soft);background:var(--paper);
}
#growth-edit-root .drawer-foot-note{
  font-size:0.74rem;color:var(--mute);line-height:1.5;display:flex;gap:10px;align-items:flex-start;
}
#growth-edit-root .drawer-foot-note .bell{
  flex:0 0 auto;width:30px;height:30px;border-radius:50%;background:var(--sage-deep);color:var(--cream);
  display:flex;align-items:center;justify-content:center;font-size:0.9rem;
}
#growth-edit-root .drawer-foot-note strong{color:var(--ink);font-weight:600;display:block;margin-bottom:1px}
#growth-edit-root .rationale{
  margin-top:clamp(56px,7vw,88px);
  background:linear-gradient(160deg,var(--sage) 0%,var(--sage-deep) 100%);
  color:var(--cream);border-radius:24px;overflow:hidden;position:relative;
  padding:clamp(36px,5.5vw,68px) clamp(26px,4vw,60px);box-shadow:var(--shadow);
}
#growth-edit-root .rationale::before{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(circle at 22% 18%,rgba(243,238,229,0.16),transparent 55%),
            radial-gradient(circle at 80% 88%,rgba(243,238,229,0.1),transparent 52%);
}
#growth-edit-root .rationale-head{position:relative;max-width:760px;margin:0 auto clamp(34px,4.5vw,52px);text-align:center}
#growth-edit-root .rationale-head .eyebrow{display:block;margin-bottom:16px}
#growth-edit-root .rationale-head h2{color:var(--cream);font-style:italic;font-weight:300;margin-bottom:0.5em}
#growth-edit-root .rationale-principle{
  font-size:clamp(1rem,1.7vw,1.16rem);line-height:1.7;opacity:0.95;margin:0;
  text-wrap:pretty;
}
#growth-edit-root .rationale-pillars{
  position:relative;display:grid;grid-template-columns:repeat(2,1fr);
  gap:clamp(18px,2.6vw,30px);max-width:880px;margin:0 auto;
}
#growth-edit-root .pillar{
  background:rgba(243,238,229,0.1);border:1px solid rgba(243,238,229,0.2);
  border-radius:16px;padding:clamp(22px,2.6vw,30px);
}
#growth-edit-root .pillar-num{
  font-size:1.5rem;font-style:italic;opacity:0.6;display:block;margin-bottom:10px;
}
#growth-edit-root .pillar-title{
  font-family:'Cormorant Garamond',serif;font-size:1.35rem;font-weight:500;
  line-height:1.15;margin-bottom:9px;
}
#growth-edit-root .pillar-text{font-size:0.9rem;line-height:1.6;opacity:0.92;margin:0;text-wrap:pretty}
#growth-edit-root .rationale-close{
  position:relative;text-align:center;max-width:620px;margin:clamp(32px,4vw,48px) auto 0;
  font-size:clamp(1.2rem,2.2vw,1.55rem);line-height:1.4;font-style:italic;
  color:var(--cream);
}
@media (max-width:680px){
#growth-edit-root .rationale-pillars{grid-template-columns:1fr}
}
#growth-edit-root .foot{
  background:linear-gradient(180deg,var(--sage) 0%,var(--sage-deep) 100%);
  color:var(--cream);text-align:center;padding:clamp(64px,9vw,100px) 24px;position:relative;overflow:hidden;
}
#growth-edit-root .foot::before{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(circle at 70% 30%,rgba(243,238,229,0.14),transparent 55%);
}
#growth-edit-root .foot-inner{position:relative;max-width:560px;margin:0 auto}
#growth-edit-root .foot h2{color:var(--cream);font-style:italic;font-weight:300;margin-bottom:0.3em}
#growth-edit-root .foot p{opacity:0.9;font-size:0.96rem}
#growth-edit-root .foot-brand{
  font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.3rem;margin-top:34px;
}
#growth-edit-root .foot-brand small{
  display:block;font-family:'Inter',sans-serif;font-style:normal;font-size:0.58rem;
  letter-spacing:0.32em;text-transform:uppercase;opacity:0.75;margin-top:7px;
}
#growth-edit-root .toast{
  position:fixed;bottom:26px;left:50%;transform:translateX(-50%) translateY(20px);
  background:var(--ink);color:var(--cream);padding:13px 24px;border-radius:999px;
  font-size:0.78rem;font-weight:500;letter-spacing:0.02em;z-index:100;
  opacity:0;visibility:hidden;transition:all .3s ease;box-shadow:var(--shadow);
  display:flex;align-items:center;gap:9px;
}
#growth-edit-root .toast.show{opacity:1;visibility:visible;transform:translateX(-50%) translateY(0)}
@media (prefers-reduced-motion: no-preference){
#growth-edit-root .reveal{opacity:0;transform:translateY(18px);transition:opacity .7s ease,transform .7s ease}
#growth-edit-root .reveal.in{opacity:1;transform:none}
}
@media (max-width:900px){
#growth-edit-root .finder-grid.four{grid-template-columns:repeat(2,1fr)}
}
@media (max-width:720px){
#growth-edit-root .finder-grid{grid-template-columns:1fr;gap:10px}
#growth-edit-root .finder-grid.four{grid-template-columns:1fr}
#growth-edit-root .chip{display:flex;align-items:center;gap:14px;padding:16px 18px}
#growth-edit-root .chip-name{margin-bottom:0;font-size:1.25rem;flex:0 0 auto;min-width:88px}
#growth-edit-root .chip-tick{position:static;margin-left:auto}
#growth-edit-root .picks{grid-template-columns:1fr}
#growth-edit-root .layer-cols{grid-template-columns:1fr}
#growth-edit-root .cat-head{flex-wrap:wrap}
#growth-edit-root .cat-cadence{text-align:left;width:100%;order:3}
}
`;

const HTML = `
<!-- ===== STICKY HEADER ===== -->
<header class="topbar">
  <div class="topbar-inner">
    <div class="topbar-brand">The Hair Insider<small>The Growth Edit</small></div>
    <div style="display:flex;align-items:center;gap:20px">
      <nav style="display:flex;gap:16px;align-items:center;font-family:'Inter',sans-serif;font-size:0.68rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase">
        <a href="/" style="color:var(--ink);text-decoration:none">Home</a>
        <a href="/account?tab=library" style="color:var(--ink);text-decoration:none">Library</a>
        <a href="/account" style="color:var(--ink);text-decoration:none">Account</a>
      </nav>
      <button class="list-btn" id="list-btn">
        My List <span class="count" id="list-count" style="display:none">0</span>
      </button>
    </div>
  </div>
</header>

<!-- ===== HERO ===== -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-mark">The Hair Insider · Professional Edit</div>
    <h1>The Growth<br>Product Edit</h1>
    <p class="hero-sub">The exact products that grow your hair — matched to your type.</p>
    <p class="hero-note">A curated, salon-grade routine built around <em>Davines</em> and professional-brand picks, with an honest, more affordable match for every step. Find your hair type, get your shelf, save your list.</p>
    <a class="hero-cta" href="#finder">Find your hair type <span class="arrow">↓</span></a>
    <div class="hero-meta">
      <span>108 hair profiles</span><span>Complete 9-step routine</span><span>Pro + budget match</span>
    </div>
  </div>
</section>

<!-- ===== FINDER ===== -->
<section class="sec" id="finder">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Step one</span>
      <h2 class="serif">Find your hair type</h2>
      <p>Three quick choices — your strand texture, your density, and your curl pattern — unlock a routine built precisely for you. Add your colour status and it adapts for blonde or colour-treated hair too.</p>
    </div>

    <div class="finder-step">
      <div class="finder-step-label">
        <span class="finder-step-num serif">i.</span>
        <span class="finder-step-title">Your strand texture</span>
      </div>
      <div class="finder-grid" id="texture-grid"></div>
    </div>

    <div class="finder-step">
      <div class="finder-step-label">
        <span class="finder-step-num serif">ii.</span>
        <span class="finder-step-title">Your hair density</span>
      </div>
      <div class="finder-grid" id="density-grid"></div>
    </div>

    <div class="finder-step">
      <div class="finder-step-label">
        <span class="finder-step-num serif">iii.</span>
        <span class="finder-step-title">Your curl pattern</span>
      </div>
      <div class="finder-grid four" id="pattern-grid"></div>
    </div>

    <div class="finder-step">
      <div class="finder-step-label">
        <span class="finder-step-num serif">iv.</span>
        <span class="finder-step-title">Colour status <em class="finder-opt">— for blondes &amp; colour</em></span>
      </div>
      <div class="finder-grid" id="status-grid"></div>
    </div>

    <details class="finder-help">
      <summary>Not sure? Two-minute test <span class="ic">+</span></summary>
      <div class="finder-help-body">
        <p><strong>Texture (how thick each strand is).</strong> Take a single shed hair and roll it between your fingers. If you can barely feel it, you’re <strong>fine</strong>. If it feels distinctly thick or wiry, you’re <strong>coarse</strong>. Anywhere in between is <strong>medium</strong>.</p>
        <p><strong>Density (how much hair you have).</strong> Pull your hair into a ponytail and measure around it. Under ~2 inches reads <strong>thin</strong>, around 2–3 inches is <strong>medium</strong>, and over ~4 inches is <strong>dense</strong>. Or simply check how easily you see your scalp in the mirror — the more visible, the thinner the density.</p>
        <p><strong>Curl pattern (the shape of the strand).</strong> Wash your hair and let it air-dry with no product. If it dries flat and straight you’re <strong>straight</strong>; loose S-shapes are <strong>wavy</strong>; defined spirals or ringlets are <strong>curly</strong>; tight coils, zig-zags or kinks are <strong>coily</strong>.</p>
        <p><strong>Colour status.</strong> Leave it on <strong>Natural</strong> if your hair is uncoloured. Choose <strong>Colour-treated</strong> for any dye or gloss, or <strong>Blonde</strong> if you lighten or highlight — both swap in moisture-rich, colour-protecting Davines lines, since processed hair breaks from dryness.</p>
      </div>
    </details>

    <div class="generate-wrap">
      <button class="generate-btn" id="generate-btn" disabled="">
        <span class="generate-label">Generate my edit</span>
        <span class="generate-arrow">↓</span>
      </button>
      <p class="generate-hint" id="generate-hint">Choose your texture, density &amp; pattern above to unlock your routine.</p>
    </div>
  </div>
</section>

<!-- ===== RESULT + SHELF (rendered by JS) ===== -->
<section class="sec paper">
  <div class="wrap">
    <div id="result" class="result"></div>
  </div>
</section>

<!-- ===== FOOTER ===== -->
<footer class="foot">
  <div class="foot-inner">
    <span class="eyebrow light">Your routine, on repeat</span>
    <h2 class="serif">Growth is a habit,<br>not a one-time buy.</h2>
    <p>Save your products, repurchase before they run out, and keep the routine going. Consistency is the whole secret — your hair rewards the ones who keep showing up.</p>
    <div class="foot-brand">The Hair Insider<small>The Growth Edit</small></div>
  </div>
</footer>

<!-- ===== SAVED LIST DRAWER ===== -->
<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer" aria-label="My saved products">
  <div class="drawer-head">
    <div>
      <h3 class="serif">My List</h3>
      <p>Your personalised shopping list</p>
    </div>
    <button class="drawer-close" id="drawer-close" aria-label="Close">×</button>
  </div>
  <div class="drawer-body" id="drawer-body"></div>
  <div class="drawer-foot">
    <div class="drawer-foot-note">
      <span class="bell">↻</span>
      <span><strong>Repurchase reminders</strong>Each product shows how long it lasts. Set a calendar nudge to re-buy on time and never break your routine.</span>
    </div>
  </div>
</aside>

<!-- ===== TOAST ===== -->
<div class="toast" id="toast"><span>Added to your list</span></div>
`;

export default function GrowthEditClient() {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;
        const cleanup = initGrowthEdit();
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
                id='growth-edit-root'
                dangerouslySetInnerHTML={{ __html: HTML }}
            />
        </>
    );
}
