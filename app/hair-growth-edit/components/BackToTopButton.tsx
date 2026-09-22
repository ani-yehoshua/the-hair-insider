"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

// Shows once the visitor has scrolled far enough that "top" isn't already
// on screen -- useful here specifically because Results and GuideView run
// very long.
export function BackToTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 480);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (!visible) return null;

    return (
        <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-opacity hover:opacity-90"
        >
            <ArrowUp size={18} />
        </button>
    );
}
