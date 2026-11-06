export interface VideoPlayback {
    volume: number;
    muted: boolean;
    play(): Promise<void>;
}

export const AMBIENT_VOLUME = 0.15;

// Sound is opt-in only. Never unmute as part of automatic playback.
export async function startAmbientVideo(video: VideoPlayback) {
    video.volume = AMBIENT_VOLUME;
    video.muted = true;
    try {
        await video.play();
        return "muted" as const;
    } catch {
        return "blocked" as const;
    }
}
