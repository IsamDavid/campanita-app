export const protectedPrefixes = [
  "/hoy",
  "/salud",
  "/comidas",
  "/medicinas",
  "/agenda",
  "/insumos",
  "/veterinaria",
  "/resumen",
  "/familia",
  "/mas",
  "/configuracion"
] as const;

export function isProtectedPath(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isAuthPath(pathname: string) {
  return pathname === "/login" || pathname === "/signup";
}
