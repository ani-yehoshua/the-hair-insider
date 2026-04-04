import type { Metadata } from "next";
import AdminProductsClient from "./AdminProductsClient";

export const metadata: Metadata = {
    title: "Product Catalog",
    description: "Manage the ShopMy product catalog for hair recommendations.",
    robots: { index: false, follow: false },
};

export default function AdminProductsPage() {
    return <AdminProductsClient />;
}
