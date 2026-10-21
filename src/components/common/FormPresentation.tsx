import type { ReactNode } from 'react';

/** Save controls remain in document flow and stack on small screens. */
export function FormActions({ children, help }: { children: ReactNode; help?: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 mt-6 flex flex-col gap-3 border-t border-navy-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-navy-800 dark:bg-navy-900">
      <div className="max-w-xl text-xs leading-relaxed text-navy-500 dark:text-navy-300">
        {help || 'Review your changes before saving. Changes are not saved automatically.'}
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">{children}</div>
    </div>
  );
}

export function FormFeedback({
  errorCount = 0,
  isSaving = false,
  help = 'Required fields are marked with an asterisk. Save your changes before leaving this page.',
}: {
  errorCount?: number;
  isSaving?: boolean;
  help?: string;
}) {
  return (
    <div className="mb-6 space-y-2">
      <p role="status" className="text-sm leading-relaxed text-navy-500 dark:text-navy-300">
        {isSaving ? 'Saving changes… Please wait for confirmation.' : help}
      </p>
      {errorCount > 0 && (
        <p
          role="alert"
          className="rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-300"
        >
          Some fields need attention. Review the highlighted fields before saving.
        </p>
      )}
    </div>
  );
}

export function FormSectionLinks({ sections }: { sections: { id: string; label: string }[] }) {
  return (
    <nav aria-label="Jump to form section" className="mb-6 flex flex-wrap gap-2">
      {sections.map((section, index) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-navy-100 px-3 py-2 text-sm font-medium text-navy-600 hover:border-brand-300 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-500 dark:border-navy-700 dark:text-navy-200"
        >
          <span className="text-xs text-brand-600 dark:text-brand-300">{index + 1}.</span>
          {section.label}
        </a>
      ))}
    </nav>
  );
}
