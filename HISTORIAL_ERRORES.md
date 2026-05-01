# Historial de errores y pendientes

Fecha de revisión: 2026-05-01

## Resumen

La aplicación compila y las rutas principales existen, pero hay problemas de navegación y de experiencia de carga que pueden sentirse como pantallas rotas o interfaces que tardan en aparecer.

Validación ejecutada:

- `npm run build`: pasa.
- `npm run typecheck`: pasa si se ejecuta solo.
- `npm run lint`: pasa, pero usa `next lint`, que ya está deprecado.
- Prueba HTTP local en producción: `/` redirige a `/login`; `/login` responde `200`; `/hoy` y `/salud` redirigen a `/login` cuando no hay sesión, comportamiento esperado en modo real.

## Errores y pendientes detectados

### 1. Navegación inferior incompleta

Estado: resuelto el 2026-05-01

Severidad: alta

Archivos relacionados:

- `components/layout/BottomNav.tsx`
- `app/(app)/insumos/page.tsx`
- `app/(app)/veterinaria/page.tsx`
- `app/(app)/resumen/page.tsx`
- `app/(app)/configuracion/page.tsx`

Problema:

La navegación inferior solo muestra:

- `/hoy`
- `/salud`
- `/comidas`
- `/medicinas`
- `/familia`

Pero la app también tiene rutas funcionales protegidas:

- `/insumos`
- `/veterinaria`
- `/resumen`
- `/configuracion`

Impacto:

`/insumos` y `/resumen` quedan prácticamente ocultas en la interfaz. `/veterinaria` solo aparece desde una acción rápida en Hoy, y `/configuracion` solo desde el icono superior. Esto puede percibirse como error de navegación porque hay pantallas existentes sin acceso claro.

Sugerencia:

Definir una arquitectura de navegación:

- Opción A: agregar una pantalla "Más" en el bottom nav y mover ahí Insumos, Veterinaria, Resumen y Configuración.
- Opción B: cambiar el bottom nav para incluir las secciones reales prioritarias.
- Opción C: agregar tarjetas de acceso visibles desde `/hoy` o `/familia`.

Resolución aplicada:

Se agregó `/mas` como pantalla de secciones desde el header, sin reemplazar "Familia" en el bottom nav. La pantalla concentra accesos a `/familia`, `/insumos`, `/veterinaria`, `/resumen` y `/configuracion`, y se añadió `/mas` a las rutas protegidas.

### 2. Botón de notificaciones sin acción

Estado: resuelto el 2026-05-01

Severidad: media

Archivo relacionado:

- `components/layout/Header.tsx`

Problema:

El botón con icono de campana se renderiza como `Button`, pero no tiene `onClick`, `href`, estado ni feedback visual.

Impacto:

El usuario puede tocarlo y no pasa nada. En navegación móvil esto parece un control roto.

Sugerencia:

Conectarlo a `/configuracion`, abrir un panel de permisos/notificaciones, o quitarlo hasta que tenga comportamiento real.

Resolución aplicada:

El botón de campana ahora es un enlace a `/configuracion`, donde ya existe la gestión de notificaciones.

### 3. Carga duplicada de contexto en rutas protegidas

Estado: resuelto el 2026-05-01

Severidad: alta

Archivos relacionados:

- `app/(app)/layout.tsx`
- `app/(app)/*/page.tsx`
- `lib/auth.ts`

Problema:

`app/(app)/layout.tsx` ejecuta `requireAppContext()`, pero cada página protegida vuelve a ejecutar `requireAppContext()`.

Ejemplo:

- El layout valida contexto.
- Luego `/hoy`, `/salud`, `/comidas`, `/medicinas`, etc. vuelven a pedir el mismo contexto.

Impacto:

Cada navegación protegida puede hacer trabajo duplicado contra Supabase: usuario, perfil, household y pet. Esto aumenta el tiempo hasta que carga la interfaz y puede generar sensación de pantalla lenta o intermitente.

Sugerencia:

Centralizar el contexto por request usando `cache()` de React/Next, o hacer que el layout cargue el contexto y lo pase mediante provider. La opción con `cache()` es la menos invasiva.

Resolución aplicada:

`getCurrentUser()` y `getAppContext()` ahora usan `cache()` de React, por lo que el layout protegido y la página del mismo request reutilizan el resultado en vez de repetir las mismas consultas.

### 4. Falta de estados de carga globales

Estado: resuelto el 2026-05-01

Severidad: media

Archivos relacionados:

- `app/(app)/salud/loading.tsx`
- `app/(app)/layout.tsx`
- `app/(app)/*/page.tsx`

Problema:

Solo existe `loading.tsx` para `/salud`. Las demás secciones protegidas no tienen skeleton o estado de carga por segmento.

Impacto:

En rutas que dependen de Supabase, la interfaz puede tardar sin mostrar una transición clara. Esto coincide con la percepción de problemas en la carga de interfaces.

Sugerencia:

Agregar `app/(app)/loading.tsx` con un skeleton común del `AppShell`, y luego agregar loaders específicos para pantallas pesadas si hace falta.

Resolución aplicada:

Se agregó `app/(app)/loading.tsx` con header, bottom nav y skeletons compartidos para todas las rutas protegidas.

### 5. Scripts de validación con riesgo de carrera

Estado: resuelto el 2026-05-01

Severidad: baja

Archivos relacionados:

- `package.json`
- `tsconfig.json`

Problema:

`npm run typecheck` ejecuta `next typegen && tsc --noEmit`, y `npm run build` también genera tipos en `.next`. Si ambos se ejecutan al mismo tiempo, pueden competir sobre `.next/types`.

Evidencia:

Al correr `build` y `typecheck` en paralelo apareció:

```txt
error TS6053: File '.next/types/cache-life.d.ts' not found.
```

Luego, ejecutando `npm run typecheck` solo, pasó correctamente.

Impacto:

En CI o durante desarrollo, una validación paralela puede fallar aunque el código esté bien.

Sugerencia:

No correr `build` y `typecheck` en paralelo. Si se quiere automatizar, crear un script secuencial, por ejemplo `npm run verify`, que ejecute lint, typecheck y build en orden.

Resolución aplicada:

Se agregó `npm run verify`, que ejecuta `lint`, `typecheck` y `build` de forma secuencial.

### 6. `npm run lint` usa comando deprecado

Estado: resuelto el 2026-05-01

Severidad: baja

Archivo relacionado:

- `package.json`

Problema:

El script usa `next lint`, que Next.js marca como deprecado y removible en Next.js 16.

Evidencia:

```txt
`next lint` is deprecated and will be removed in Next.js 16.
```

Impacto:

La validación dejará de funcionar al actualizar Next.

Sugerencia:

Migrar a ESLint CLI con el codemod recomendado por Next o configurar `eslint` directamente.

Resolución aplicada:

Se migró a `eslint . --max-warnings=0` con `eslint.config.mjs` en formato flat config. Se retiró `.eslintrc.json`.

### 7. Duplicación de rutas protegidas

Estado: resuelto el 2026-05-01

Severidad: baja

Archivos relacionados:

- `middleware.ts`
- `lib/auth.ts`

Problema:

La lista de rutas protegidas existe duplicada en `middleware.ts` y `lib/auth.ts`.

Impacto:

Cuando se agregue o cambie una ruta, puede protegerse en un lado y olvidarse en el otro. Esto genera errores difíciles de detectar en navegación y autenticación.

Sugerencia:

Extraer `protectedPrefixes` a un módulo compartido, por ejemplo `lib/routes.ts`, y reutilizarlo en middleware y auth.

Resolución aplicada:

Se agregó `lib/routes.ts` con `protectedPrefixes`, `isProtectedPath()` e `isAuthPath()`. `middleware.ts` y `lib/auth.ts` consumen esa fuente compartida.

## Notas de comportamiento observado

- En modo real, sin sesión, las rutas protegidas redirigen a `/login`. Esto es esperado.
- En modo demo, la app debería entrar directo a `/hoy` si faltan `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- El puerto `3000` ya estaba ocupado durante la revisión, así que la prueba local se hizo intentando usar `3100`.

## Prioridad sugerida

Todos los puntos listados arriba quedaron resueltos el 2026-05-01. El siguiente bloque de trabajo debería salir de una revisión nueva o de nuevas prioridades funcionales.
