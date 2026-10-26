import type { Metadata } from "next";
import GrowthEditClient from "./GrowthEditClient";
import { growthEditFontVariables } from "./fonts";
import { QUESTIONS } from "./data/questions";

export const metadata: Metadata = {
  title: "The Growth Edit",
  description: `A ${QUESTIONS.length}-question diagnostic assessment for women struggling to retain hair length.`,
  alternates: { canonical: "/hair-growth-edit" },
  robots: { index: true, follow: true },
};

export default function GrowthEditPage() {
  return (
    <div className={`growth-edit-quiz ${growthEditFontVariables}`}>
      <GrowthEditClient />
    </div>
  );
}
