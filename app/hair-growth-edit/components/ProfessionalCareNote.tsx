import { PROFESSIONAL_CARE_NOTE } from '../lib/professionalCareCopy';

export function ProfessionalCareNote({ optional = false }: { optional?: boolean }) {
  return (
    <aside className="border border-foreground/20 bg-paper px-5 py-4 text-foreground" role="note" aria-label="Professional care comes first" data-testid="professional-care-note">
      <p className="font-serif text-lg leading-snug">{PROFESSIONAL_CARE_NOTE.heading}</p>
      <p className="mt-2 text-xs leading-relaxed text-foreground/80">{PROFESSIONAL_CARE_NOTE.body}</p>
      {optional && <p className="mt-3 text-xs leading-relaxed text-foreground/80">{PROFESSIONAL_CARE_NOTE.optional}</p>}
    </aside>
  );
}
