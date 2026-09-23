"use client";

interface ViewTabsProps {
    active: "results" | "guide";
    onSelect: (view: "results" | "guide") => void;
}

const TABS = [
    { key: "results", label: "Results" },
    { key: "guide", label: "Growth Edit" },
] as const;

export function ViewTabs({ active, onSelect }: ViewTabsProps) {
    return (
        <div className="mx-auto flex w-full max-w-4xl justify-center gap-2 px-5 pt-8 md:px-8">
            {TABS.map((tab) => (
                <button
                    key={tab.key}
                    type="button"
                    onClick={() => onSelect(tab.key)}
                    className={`rounded-full px-5 py-2 text-[0.7rem] font-medium uppercase tracking-widest transition-colors ${
                        active === tab.key
                            ? "bg-foreground text-background"
                            : "border border-foreground/20 text-foreground/60 hover:text-foreground"
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
