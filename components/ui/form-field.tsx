export function FormField({
  label,
  hint,
  children
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-on-surface">{label}</span>
        {hint ? <span className="text-xs text-on-surface-variant">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}
