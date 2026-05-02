"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  CalendarDays,
  ClipboardCheck,
  HeartPulse,
  House
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/hoy", label: "Hoy", icon: CalendarDays },
  { href: "/salud", label: "Salud", icon: HeartPulse },
  { href: "/comidas", label: "Comidas", icon: House },
  { href: "/agenda", label: "Agenda", icon: ClipboardCheck },
  { href: "/insumos", label: "Insumos", icon: Boxes }
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/70 bg-white/90 px-4 pb-6 pt-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around rounded-[2rem] border border-surface-container bg-white/90 px-2 py-2 shadow-soft">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-14 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition",
                active
                  ? "bg-primary-container/20 text-primary"
                  : "text-on-surface-variant"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "fill-primary/10")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
