import type { Metadata } from "next";
import GrowthEditClient from "./GrowthEditClient";
import { growthEditFontVariables } from "./fonts";

export const metadata: Metadata = {
  title: "The Growth Edit",
  description: "A 25-question diagnostic assessment for women struggling to retain hair length.",
  robots: { index: true, follow: true },
};

export default function GrowthEditPage() {
  return (
    <div className={`growth-edit-quiz ${growthEditFontVariables}`}>
      <GrowthEditClient />
    </div>
  );
}
