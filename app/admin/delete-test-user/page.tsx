import type { Metadata } from "next";
import DeleteTestUserClient from "./DeleteTestUserClient";

export const metadata: Metadata = {
    title: "Delete Test User",
    description: "Delete a test user's data from Supabase, Stripe, and Resend in one shot.",
    robots: { index: false, follow: false },
};

export default function DeleteTestUserPage() {
    return <DeleteTestUserClient />;
}
