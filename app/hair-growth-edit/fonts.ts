import { Cormorant_Garamond, Inter } from "next/font/google";

// Loaded here (not in the root layout) so only the Growth Edit downloads them.
// The variable classes must be applied to the page wrapper and to the portaled
// checkout sheet, which renders outside that wrapper.
export const cormorantGaramond = Cormorant_Garamond({
    variable: "--font-cormorant-garamond",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

export const growthEditFontVariables = `${cormorantGaramond.variable} ${inter.variable}`;
