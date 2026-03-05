import type { ReactNode } from "react";

type LeadFormSectionProps = {
  id?: string;
  title: string;
  subtitle?: string;
  description?: ReactNode;
  children?: ReactNode;
};

export default function LeadFormSection({
  id,
  title,
  subtitle,
  description,
  children,
}: LeadFormSectionProps) {
  return (
    <section id={id} tabIndex={-1} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3 sm:p-8">
      <div className="space-y-3 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-4xl lg:text-[2.5rem]">{title}</h2>
        <p className="text-slate-600 leading-relaxed text-base md:text-lg md:leading-relaxed">{subtitle}</p>
        {description ? (
          <div className="space-y-2 text-slate-600 leading-relaxed text-base md:text-lg">{description}</div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
