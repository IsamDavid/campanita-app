import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "@/app/globals.css";

import { PwaSetup } from "@/components/layout/PwaSetup";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Campanita",
  description: "Control diario de salud, comidas, medicinas y seguimiento veterinario de Campanita.",
  manifest: "/manifest.json",
  applicationName: "Campanita",
  appleWebApp: {
    capable: true,
    title: "Campanita",
    statusBarStyle: "default"
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: "#f9faf5",
  colorScheme: "light",
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <PwaSetup />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
