"use client";

import { useEffect, useRef, useState } from 'react';
import { founderTransformation } from '../data/founderTransformation';
import { AMBIENT_VOLUME, startAmbientVideo } from '../lib/videoPlayback';

export function FounderVideoSpotlight() {
  const video = founderTransformation?.video;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    void startAmbientVideo(element);
  }, [video?.source]);

  function toggleSound() {
    const element = videoRef.current;
    if (!element) return;
    element.muted = soundOn;
    if (!soundOn) {
      element.volume = AMBIENT_VOLUME;
      void element.play().catch(() => { element.muted = true; });
    }
  }

  if (!video) return null;

  return (
    <section className="mt-8 grid items-center gap-5 border-t border-foreground/15 pt-6 sm:grid-cols-[minmax(0,1fr)_240px] sm:gap-8" aria-labelledby="founder-video-heading" data-testid="founder-video-spotlight">
      <div>
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/60">My hair journey</p>
        <h2 id="founder-video-heading" className="mt-3 font-serif text-3xl leading-tight text-foreground">This is my hair now.</h2>
        <p id="founder-video-description" className="mt-3 max-w-sm text-sm leading-relaxed text-foreground/80">For years, I thought my hair just didn’t grow. I even had my husband and my mom measuring it on my back.</p>
        <button type="button" onClick={toggleSound} aria-pressed={soundOn} className="mt-3 rounded-full border border-foreground/20 px-4 py-2 text-xs text-foreground">
          {soundOn ? 'Mute music' : 'Play soft music'}
        </button>
        <p className="mt-2 text-xs leading-relaxed text-foreground/65">Plays muted. Music is optional. My personal experience; individual results vary.</p>
      </div>
      <video
        ref={videoRef}
        onVolumeChange={event => setSoundOn(!event.currentTarget.muted && event.currentTarget.volume > 0)}
        className="mx-auto aspect-[9/16] w-full max-w-[240px] rounded-2xl bg-black object-contain"
        controls
        autoPlay
        muted
        playsInline
        preload="metadata"
        poster={video.poster}
        width={720}
        height={1280}
        aria-label="My hair in motion"
        aria-describedby="founder-video-description"
      >
        <source src={video.source} type="video/mp4" />
        Your browser cannot play this video. <a href={video.source}>Open the hair transformation video.</a>
      </video>
    </section>
  );
}
