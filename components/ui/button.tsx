"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";

const styles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary shadow-md shadow-primary/20 hover:bg-primary/90",
  secondary:
    "bg-secondary-container/30 text-on-secondary-container hover:bg-secondary-container/50",
  ghost: "bg-transparent text-on-surface hover:bg-surface-container-low",
  danger: "bg-tertiary text-on-tertiary hover:bg-tertiary/90",
  outline:
    "border border-primary-container/60 bg-white text-primary hover:bg-primary-container/10"
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
          styles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
