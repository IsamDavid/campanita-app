# Campanita

Campanita es una PWA mobile-first para registrar salud, heces, comidas, medicinas, insumos y seguimiento veterinario de una perrita llamada Campanita. Esta base convierte los mockups HTML/CSS existentes en una app real con Next.js, Supabase Auth, PostgreSQL, Storage privado, realtime y notificaciones push.

## Estado actual

La base ya incluye:

- Next.js App Router + TypeScript + Tailwind CSS
- Login y signup con Supabase Auth
- Join de un segundo usuario al mismo household mediante `invite_code`
- Layout móvil con bottom navigation fija
- Dashboard "Hoy" con pendientes, acciones rápidas, alertas y actividad
- Registro de heces con foto a Supabase Storage
- Comidas con horarios, checks del día y protección contra duplicados
- Medicinas con horarios, checks del día y soporte para receta
- Insumos, veterinaria, resumen y familia en versión funcional inicial
- PWA con `manifest.json`, `sw.js` e íconos locales
- Endpoints de suscripción y envío de notificaciones push
- SQL de schema, RLS y seed base

## Análisis del proyecto original

### 1. Archivos HTML/CSS detectados

Se encontraron 7 mockups HTML con Tailwind inline y un documento de diseño:

- `hoy_dashboard/code.html`
- `registro_de_heces/code.html`
- `comidas/code.html`
- `medicinas/code.html`
- `insumos/code.html`
- `historial_veterinario/code.html`
- `resumen_veterinario/code.html`
- `familia/code.html`
- `campanita/DESIGN.md`

Cada carpeta también tenía `screen.png` como referencia visual.

### 2. Pantallas detectadas

- Dashboard de hoy
- Registro nuevo de heces
- Plan de comidas
- Medicinas activas
- Inventario de insumos
- Historial veterinario / expediente
- Resumen para veterinaria
- Familia / cuidadores

### 3. Componentes reutilizables extraídos del mockup

- App bar superior con nombre de Campanita y acceso a notificaciones
- Bottom navigation redondeada y fija
- Cards blancas con sombra suave
- Chips de estado
- Hero / pet header
- Tarjetas de pendientes de comida y medicina
- Grilla de quick actions
- Timeline veterinario
- Tarjetas de familia y actividad reciente
- Formularios con inputs suaves y botones grandes pill-shaped

### 4. Assets, colores, tipografía e íconos detectados

- Tipografía: `Plus Jakarta Sans`
- Paleta principal:
  - fondo crema `#f9faf5`
  - verde principal `#406749`
  - verde suave `#8fb996`
  - lavanda `#b7b4fe`
  - coral `#f49595`
  - texto oscuro `#1a1c1a`
- Íconos: Material Symbols en los mockups
- Assets reales del repo: solo screenshots y mockups; las fotos dentro del HTML eran remotas y no reutilizables como assets de producto

### 5. Qué hubo que rehacer para convertirlo bien a Next.js

- Todo el HTML estático se rehizo por componentes React en vez de copiar bloques Tailwind inline
- Se sustituyó la estructura de mockups por un `AppShell` compartido
- Se separó la lógica de dominio en componentes y utilidades de `lib/`
- Se diseñó una capa de datos para Supabase y una ruta de evolución a features multiusuario
- Se implementó Storage privado con signed URLs en vez de imágenes públicas directas
- Se añadió esquema relacional, RLS, realtime y endpoints de notificaciones
- Se convirtió el diseño a un sistema consistente de tokens Tailwind y componentes reutilizables

## Estructura principal

```txt
app/
  (auth)/
  (app)/
  api/
components/
  layout/
  campanita/
  ui/
lib/
types/
supabase/
public/
```

## Rutas importantes

- `/login`
- `/signup`
- `/hoy`
- `/salud`
- `/salud/heces/nuevo`
- `/salud/heces/[id]`
- `/comidas`
- `/medicinas`
- `/insumos`
- `/veterinaria`
- `/resumen`
- `/familia`
- `/configuracion`

## Variables de entorno

Usa `.env.local` con estas variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:tu-correo@example.com
NEXT_PUBLIC_APP_URL=
```

### Qué va al cliente

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `NEXT_PUBLIC_APP_URL`

### Qué va solo al servidor

- `SUPABASE_SERVICE_ROLE_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

No expongas `SUPABASE_SERVICE_ROLE_KEY` ni `VAPID_PRIVATE_KEY` en el cliente.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run supabase:types
```

## Cron de recordatorios

En Vercel, `vercel.json` configura una llamada automática cada 5 minutos a:

```txt
/api/cron/reminders
```

Ese endpoint procesa recordatorios pendientes y envía web push a las suscripciones del household. Para que funcione en producción necesitas las variables `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` y `SUPABASE_SERVICE_ROLE_KEY`.

## Instalación local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Configurar Supabase

### 1. Crear el proyecto

1. Crea un proyecto en Supabase Dashboard.
2. Copia `Project URL`, `anon public key` y `service_role key`.
3. Pégalas en `.env.local`.

Referencia oficial:

- Supabase docs: https://supabase.com/docs/
- RLS: https://supabase.com/docs/guides/auth/auth-deep-dive/auth-row-level-security

### 2. Configurar Auth

Para el flujo inicial de `/signup`, esta base asume `email confirmation` desactivado en Supabase Auth, para que el primer owner pueda crear `profile + household + pet` en el mismo paso.

Flujo multiusuario mínimo:

- el owner crea el hogar
- en `/familia` ve el `invite_code`
- la segunda persona usa ese código en `/signup`
- el sistema la agrega al mismo `household` con rol `caregiver`
- ambos ven y actualizan los mismos datos de Campanita

Si prefieres confirmación de correo obligatoria:

- deja este flujo como base visual
- crea un onboarding post-confirmación o una Edge Function segura para bootstrap del hogar

### 3. Ejecutar SQL

Corre en este orden dentro del SQL Editor:

1. [`supabase/schema.sql`](./supabase/schema.sql)
2. [`supabase/policies.sql`](./supabase/policies.sql)
3. [`supabase/seed.sql`](./supabase/seed.sql) ajustando UUIDs reales antes de ejecutar

### 4. Buckets de Storage

Crea buckets privados:

- `stool-photos`
- `documents`
- `pet-media`
- `prescriptions`

La documentación oficial de Supabase indica que los buckets privados aplican controles mediante RLS y que los archivos se leen mediante JWT o signed URLs:

- Storage fundamentals: https://supabase.com/docs/guides/storage/buckets/fundamentals
- Creating buckets: https://supabase.com/docs/guides/storage/buckets/creating-buckets

Recomendaciones para los buckets:

- `stool-photos`: `image/*`, por ejemplo límite `10MB`
- `pet-media`: `image/*`, por ejemplo `10MB`
- `prescriptions`: `image/*, application/pdf`, por ejemplo `15MB`
- `documents`: `image/*, application/pdf`, por ejemplo `20MB`

La app sube archivos con estructura:

```txt
{household_id}/{pet_id}/{category}/{timestamp}-{filename}
```

Las policies del repo usan esa convención para proteger `storage.objects`.

### 5. Realtime

Esta base usa realtime mínimo en:

- `meal_checks`
- `medication_checks`
- `stool_logs`

El `schema.sql` ya agrega esas tablas a `supabase_realtime`.

## Notificaciones push

### Generar VAPID keys

Puedes generarlas con:

```bash
npx web-push generate-vapid-keys
```

O si prefieres JSON:

```bash
npx web-push generate-vapid-keys --json
```

Guárdalas en:

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

### Endpoints incluidos

- `POST /api/notifications/subscribe`
- `POST /api/notifications/unsubscribe`
- `POST /api/notifications/send`
- `GET /api/cron/reminders`

### Nota para iPhone

En iOS, las notificaciones web push requieren que la PWA esté instalada en la pantalla de inicio.

## PWA

La app ya incluye:

- `public/manifest.json`
- `public/sw.js`
- íconos en `public/icons`
- registro automático del service worker
- `display: standalone`
- orientación `portrait-primary`

## Deploy en Vercel

1. Sube el proyecto a GitHub.
2. Importa el repo en Vercel.
3. Configura todas las variables de entorno del `.env.example`.
4. Ejecuta el deploy.
5. Revisa que `NEXT_PUBLIC_APP_URL` apunte al dominio final.

Referencia oficial de Vercel para dominios:

- Add a domain: https://vercel.com/docs/getting-started-with-vercel/domains
- Set up custom domain: https://vercel.com/docs/domains/set-up-custom-domain

## Apuntar dominio desde Hostinger a Vercel

Flujo recomendado:

1. Agrega el dominio dentro del proyecto en Vercel.
2. Vercel te mostrará qué registros DNS necesita.
3. En Hostinger, ve a `Domains -> Domain portfolio -> Manage -> DNS / Nameservers`.
4. Crea los registros que Vercel indique.

Casos típicos:

- apex domain: `A` hacia `76.76.21.21`
- subdominio `www`: `CNAME` hacia el host que Vercel te indique, por ejemplo `cname.vercel-dns-0.com`

Referencia actual:

- Vercel custom domain setup: https://vercel.com/docs/domains/set-up-custom-domain
- Hostinger DNS records management: https://www.hostinger.com/support/1583249-how-to-manage-dns-records-at-hostinger

Notas prácticas:

- si el dominio usa nameservers de Hostinger, edita los registros ahí
- si el dominio usa nameservers de otro proveedor, edita el DNS en ese proveedor
- espera propagación DNS antes de validar SSL

## Decisiones de implementación

- Se priorizó la V1 pedida: salud, heces, comidas, medicinas, checks y resumen vet.
- Se evitó copiar el Tailwind inline de los mockups; se reconstruyó por componentes.
- Se mantuvo la paleta crema + verde + lavanda + coral del diseño.
- Se usó Storage privado con signed URLs para fotos y documentos.
- Se dejó lista la base multiusuario con `households`, `household_members`, `pets` y `profiles`.

## TODOs técnicos

- Flujo formal de invitación por email para nuevos miembros del hogar
- Onboarding robusto cuando Supabase tenga confirmación de email obligatoria
- Mejorar picker de periodo del resumen para manejar rangos arbitrarios con filtros más completos
- Reforzar UI de toasts y estados offline
- Añadir edición y borrado de registros
- Añadir tests
- Sustituir fallback tipográfico por self-hosting real de Plus Jakarta Sans si quieres 100% fidelidad sin depender de terceros
- Afinar estrategia de cron seguro en producción si quieres restringir `/api/cron/reminders` con un secreto dedicado

## Verificación realizada en este entorno

- `npm install`
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run build` ✅
- `npm run verify` ✅

`npm run verify` ejecuta `lint`, `typecheck` y `build` en orden para evitar carreras sobre `.next/types`.
