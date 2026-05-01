import { cn } from "@/lib/utils";

export function StatusBadge({
  tone,
  children,
  className
}: {
  tone: "success" | "warning" | "danger" | "neutral" | "secondary";
  children: React.ReactNode;
  className?: string;
}) {
  const styles = {
    success: "bg-primary-container/30 text-on-primary-container",
    warning: "bg-tertiary-fixed/60 text-on-tertiary-container",
    danger: "bg-tertiary-container/25 text-on-tertiary-container",
    neutral: "bg-surface-container-high text-on-surface-variant",
    secondary: "bg-secondary-container/25 text-on-secondary-container"
  };

  return (
    <span className={cn("pill-chip", styles[tone], className)}>
      {children}
    </span>
  );
}
