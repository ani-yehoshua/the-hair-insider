import type { Metadata } from "next";
import GrowthEditClient from "./GrowthEditClient";

export const metadata: Metadata = {
  title: "The Growth Edit",
  description: "A 25-question diagnostic assessment for women struggling to retain hair length.",
  robots: { index: true, follow: true },
};

export default function GrowthEditPage() {
  return (
    <div className="growth-edit-quiz">
      <GrowthEditClient />
    </div>
  );
}
