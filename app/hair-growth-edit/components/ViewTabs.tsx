"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ViewTabsProps {
    active: "results" | "guide";
    onSelect: (view: "results" | "guide") => void;
}

// Same shape as the /account page's Library/Profile tabs, just with the
// selected tab using the site's dark (foreground) color instead of the
// default light one.
export function ViewTabs({ active, onSelect }: ViewTabsProps) {
    return (
        <div className="mx-auto w-full max-w-4xl px-5 pt-8 md:px-8">
            <Tabs
                value={active}
                onValueChange={(value) =>
                    onSelect(value as "results" | "guide")
                }
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                        value="results"
                        className="data-[state=active]:bg-foreground data-[state=active]:text-background"
                    >
                        Results
                    </TabsTrigger>
                    <TabsTrigger
                        value="guide"
                        className="data-[state=active]:bg-foreground data-[state=active]:text-background"
                    >
                        Growth Edit
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
