"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isDemoMode } from "@/lib/demo";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function NotificationSettings() {
  const [supported, setSupported] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<"subscribe" | "unsubscribe" | "test" | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window);
  }, []);

  async function subscribe() {
    if (isDemoMode) {
      setMessage("Modo exploracion: conecta Supabase para activar notificaciones reales.");
      return;
    }

    if (!supported) {
      setMessage("Este navegador no soporta notificaciones web push.");
      return;
    }

    setBusy("subscribe");
    setMessage(null);

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setBusy(null);
      setMessage("Permiso denegado. En iPhone recuerda instalar la PWA en pantalla de inicio.");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
    });

    const response = await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription)
    });

    setBusy(null);
    setMessage(response.ok ? "Notificaciones activadas." : "No se pudo guardar la suscripción.");
  }

  async function unsubscribe() {
    if (isDemoMode) {
      setMessage("Modo exploracion: no hay suscripcion real que desactivar.");
      return;
    }
    if (!supported) return;
    setBusy("unsubscribe");
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });
      await subscription.unsubscribe();
    }

    setBusy(null);
    setMessage("Notificaciones desactivadas.");
  }

  async function sendTest() {
    if (isDemoMode) {
      setMessage("Modo exploracion: la notificacion de prueba esta desactivada.");
      return;
    }
    setBusy("test");
    const response = await fetch("/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Campanita",
        body: "Esta es una notificación de prueba."
      })
    });
    setBusy(null);
    setMessage(response.ok ? "Notificación de prueba enviada." : "No se pudo enviar la prueba.");
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Notificaciones</h2>
        <p className="text-sm text-on-surface-variant">
          En iOS web push funciona cuando la PWA está instalada en la pantalla de inicio.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Button type="button" onClick={subscribe} disabled={busy !== null}>
          <Bell className="h-4 w-4" />
          Activar
        </Button>
        <Button type="button" variant="outline" onClick={unsubscribe} disabled={busy !== null}>
          <BellOff className="h-4 w-4" />
          Desactivar
        </Button>
        <Button type="button" variant="secondary" onClick={sendTest} disabled={busy !== null}>
          <Send className="h-4 w-4" />
          Probar
        </Button>
      </div>
      {message ? <p className="text-sm text-on-surface-variant">{message}</p> : null}
    </Card>
  );
}
