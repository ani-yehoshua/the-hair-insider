import type { Metadata } from "next";
import GrowthEditClient from "./GrowthEditClient";
import { growthEditFontVariables } from "./fonts";
import { QUESTIONS } from "./data/questions";

export const metadata: Metadata = {
  title: "The Growth Edit — Your 30-Day Length Retention Plan",
  description: `A ${QUESTIONS.length}-question hair assessment with a personalized starting focus and a preview of your 30-day calendar and shelf.`,
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
