import type { Metadata } from "next";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
    title: "Admin",
    description: "Admin dashboard for The Hair Insider.",
    robots: { index: false, follow: false },
};

export default function AdminPage() {
    return <AdminClient />;
}
