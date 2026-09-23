"use client";

interface ViewTabsProps {
    active: "results" | "guide";
    onSelect: (view: "results" | "guide") => void;
}

const TABS = [
    { key: "results", label: "Results" },
    { key: "guide", label: "Growth Edit" },
] as const;

// Same pill-container shape as the /account page's Library/Profile tabs
// (shadcn's Tabs component), rebuilt as a plain controlled component --
// Radix's Tabs primitive wasn't reliably reflecting `active` in its
// data-state styling here, so the active/inactive classes are applied
// directly instead of depending on that.
export function ViewTabs({ active, onSelect }: ViewTabsProps) {
    return (
        <div className="mx-auto w-full max-w-4xl px-5 pt-8 md:px-8">
            <div className="grid h-9 w-full grid-cols-2 gap-1 rounded-lg bg-background p-[3px]">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onSelect(tab.key)}
                        className={`flex h-full items-center justify-center rounded-md text-sm font-medium transition-colors ${
                            active === tab.key
                                ? "bg-foreground text-background shadow-sm"
                                : "text-foreground/60 hover:text-foreground"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
