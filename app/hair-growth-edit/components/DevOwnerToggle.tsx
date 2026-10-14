// Local-testing aid: switches between the buyer's and the owner's experience
// (the "Your Routine" tab, no offer cards) without having to purchase.
//
// `process.env.NODE_ENV` is inlined when Next.js builds, so in any production
// build -- including Vercel previews -- this component returns null and its
// button is stripped out. It only exists under `npm run dev`, and it only flips
// client state; it never writes an entitlement to the database.
export function DevOwnerToggle({
    ownerView,
    onToggle,
}: {
    ownerView: boolean;
    onToggle: () => void;
}) {
    if (process.env.NODE_ENV !== "development") return null;

    return (
        <button
            type="button"
            onClick={onToggle}
            data-testid="dev-owner-toggle"
            className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full border border-foreground/30 bg-paper px-3 py-2 text-[0.6rem] font-medium uppercase tracking-widest text-foreground shadow-lg"
        >
            Dev · Owner view: {ownerView ? "on" : "off"}
        </button>
    );
}
