const beforeImage = "/growth-edit/founder/before.webp";
const afterImage = "/growth-edit/founder/after.webp";
const videoSource = "/growth-edit/founder/hair-in-motion.mp4";
const videoPoster = "/growth-edit/founder/video-poster.webp";

export interface FounderTransformationContent {
    beforeImage: string;
    afterImage: string;
    beforeAlt: string;
    afterAlt: string;
    caption: string;
    video?: {
        source: string;
        poster: string;
        description: string;
    };
}

export const founderTransformation: FounderTransformationContent | null = {
    beforeImage,
    afterImage,
    beforeAlt: "Before: my blonde, highlighted hair, photographed from behind.",
    afterAlt: "After: my long brown hair, photographed from behind outdoors.",
    caption:
        "The blonde was my before. The brown is my hair now, after years of figuring out what worked for me.",
    video: {
        source: videoSource,
        poster: videoPoster,
        description:
            "A short clip showing my brown hair moving as I lift and release the lengths.",
    },
};
