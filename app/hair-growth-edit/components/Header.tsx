import Link from "next/link";

export function Header({ 
  onProgressClick 
}: { 
  onProgressClick?: () => void 
}) {
  return (
    <header className="w-full border-b border-foreground/15 bg-paper px-6 py-5" data-testid="header-brand">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/hair-growth-edit" className="group inline-flex items-center gap-3 text-left" data-testid="link-home">
          <img
            src="/thi-logo.png"
            alt="The Hair Insider"
            className="h-10 w-10 shrink-0 rounded-[9px]"
          />
          <span className="inline-flex flex-col gap-1">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.25em] text-foreground">
              The Hair Insider
            </span>
            <span className="font-support text-xs italic text-muted-foreground transition-colors group-hover:text-foreground">
              Learn it. Then live it.
            </span>
          </span>
        </Link>

        {onProgressClick && (
          <button 
            type="button" 
            onClick={onProgressClick}
            className="hidden text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            My Progress
          </button>
        )}
      </div>
    </header>
  );
}