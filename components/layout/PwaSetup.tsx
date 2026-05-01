"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PwaSetup() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      const cleanup = async () => {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));

        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        }

        if (registrations.length > 0 && !sessionStorage.getItem("campanita-sw-cleaned")) {
          sessionStorage.setItem("campanita-sw-cleaned", "true");
          window.location.reload();
        }
      };

      cleanup().catch(() => undefined);

      return;
    }

    let refreshing = false;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
        }

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(worker);
            }
          });
        });
      })
      .catch(() => undefined);
  }, []);

  if (!waitingWorker) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-[60] mx-auto max-w-md">
      <Card className="flex items-center justify-between gap-3 border border-primary-container/40 bg-white/95 p-4 shadow-lift backdrop-blur-xl">
        <div>
          <p className="text-sm font-bold">Nueva versión disponible</p>
          <p className="text-xs text-on-surface-variant">Actualiza para ver los últimos cambios.</p>
        </div>
        <Button
          type="button"
          className="shrink-0"
          onClick={() => {
            waitingWorker.postMessage({ type: "SKIP_WAITING" });
          }}
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </Card>
    </div>
  );
}
