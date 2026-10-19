'use client';

import { ArrowLeft } from 'lucide-react';
import { useEffect, useRef } from 'react';

export interface FormWorkspaceStep {
  id: string;
  label: string;
  description?: string;
  complete?: boolean;
  invalid?: boolean;
}

interface FormWorkspaceProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  eyebrow?: string;
  context?: string;
  steps?: FormWorkspaceStep[];
  activeStep?: string;
  onStepChange?: (stepId: string) => void;
  status?: React.ReactNode;
}

/** A normal-flow page workspace. Never creates an overlay or locks body scrolling. */
export function FormWorkspace({
  title,
  description,
  onClose,
  children,
  eyebrow = 'Core Media workspace',
  context,
  steps,
  activeStep,
  onStepChange,
  status,
}: FormWorkspaceProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, []);

  return (
    <section className="mx-auto min-w-0 w-full max-w-7xl space-y-6" aria-label={title}>
      <header className="space-y-4">
        <button
          type="button"
          onClick={onClose}
          className="admin-action inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-navy-500 hover:bg-white hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 motion-safe:transition-colors dark:text-navy-200 dark:hover:bg-navy-800"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Back
        </button>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="admin-section-heading min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-300">
              {eyebrow}
            </p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="scroll-mt-24 text-2xl font-bold text-navy-900 focus-visible:outline-none sm:text-3xl dark:text-white"
            >
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-500 dark:text-navy-300">
                {description}
              </p>
            )}
          </div>
          {(context || status) && (
            <div className="flex max-w-full flex-wrap items-center gap-2 text-xs text-navy-500 dark:text-navy-300">
              {context && (
                <span className="rounded-full border border-navy-100 bg-navy-50 px-3 py-1.5 font-medium dark:border-navy-700 dark:bg-navy-800">
                  {context}
                </span>
              )}
              {status}
            </div>
          )}
        </div>
      </header>

      {steps && steps.length > 0 && (
        <nav
          aria-label="Form sections"
          className="overflow-x-auto rounded-2xl border border-navy-100 bg-navy-50/70 p-2 dark:border-navy-800 dark:bg-navy-950/60"
        >
          <ol className="flex min-w-max items-stretch gap-2">
            {steps.map((step, index) => {
              const isActive = activeStep === step.id;
              const isClickable = Boolean(onStepChange);
              const content = (
                <>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      step.invalid
                        ? 'bg-error-500 text-white'
                        : isActive
                          ? 'bg-brand-600 text-white'
                          : step.complete
                            ? 'bg-success-500 text-white'
                            : 'bg-white text-navy-500 dark:bg-navy-800 dark:text-navy-300'
                    }`}
                  >
                    {step.complete && !step.invalid ? '✓' : index + 1}
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block text-xs font-semibold text-navy-800 dark:text-white">
                      {step.label}
                    </span>
                    {step.description && (
                      <span className="hidden text-[11px] font-normal text-navy-500 sm:block dark:text-navy-400">
                        {step.description}
                      </span>
                    )}
                  </span>
                </>
              );

              return (
                <li key={step.id} className="flex min-w-0 flex-1">
                  {isClickable ? (
                    <button
                      type="button"
                      onClick={() => onStepChange?.(step.id)}
                      aria-current={isActive ? 'step' : undefined}
                      className={`flex min-h-11 min-w-[10rem] flex-1 items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
                        isActive
                          ? 'bg-white shadow-sm ring-1 ring-brand-500/20 dark:bg-navy-800'
                          : 'hover:bg-white/80 dark:hover:bg-navy-800/80'
                      }`}
                    >
                      {content}
                    </button>
                  ) : (
                    <div className="flex min-h-11 min-w-[10rem] flex-1 items-center gap-2 rounded-xl px-3 py-2">
                      {content}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <div className="admin-form-enter admin-surface min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-theme-xs sm:p-6 lg:p-8 dark:border-navy-800 dark:bg-navy-900">
        {children}
      </div>
    </section>
  );
}
