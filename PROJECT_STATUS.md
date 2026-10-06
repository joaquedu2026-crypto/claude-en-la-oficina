# Estado del proyecto — Wanna Cosmetics

Este archivo es un resumen para que cualquier sesión de Claude Code (local o en la nube) entienda el estado actual del proyecto sin que el usuario tenga que reexplicarlo. Se actualiza a medida que se agregan features o se resuelven problemas importantes.

## Qué es

Sitio web de la marca de cosméticos "Wanna Cosmetics" (sucursales en Rio Grande y Rio Gallegos, Argentina):

- **Página pública** (`/`): anuncios/publicaciones, catálogos, logo y fondo configurables, botón de compartir, y una columna flotante de contacto (WhatsApp → Instagram → Facebook, en ese orden, mismo tamaño).
- **Panel de administración** (`/admin`): protegido con contraseña. Secciones: Anuncios, Catálogos, Redes y contacto, Apariencia (logo + fondo).

## Stack técnico

- Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4.
- Prisma ORM v5.22 + PostgreSQL alojado en **Supabase**.
- Subida de imágenes/videos: Vercel Blob (`@vercel/blob`), vía upload server-side en `/api/upload`.
- Autenticación admin: cookie HMAC-firmada (`src/lib/auth.ts`), sin usuarios/roles, solo una contraseña (`ADMIN_PASSWORD`).

## Despliegue

- Proyecto de Vercel: **wanna-cosmetics**. URL pública: `https://wanna-cosmetics.vercel.app`.
- **Importante**: Vercel despliega en producción desde la rama `claude/modest-clarke-8trpfz`, **no desde `main`**. Cualquier trabajo nuevo debe pushearse a esa rama (o cambiar la rama de producción en Vercel si se decide mergear a main en algún momento).
- Variables de entorno (configuradas en Vercel, no están en el repo): `DATABASE_URL` (connection string de Supabase, **Session Pooler**, puerto 5432 — el Transaction Pooler port 6543 NO sirve porque `prisma migrate deploy` se cuelga con pgbouncer en modo transacción), `ADMIN_PASSWORD`, `SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN`.
- Build command: `npm run build` → corre `node scripts/migrate-with-retry.mjs && next build` (ver sección de problema conocido más abajo).

## Modelo de datos (`prisma/schema.prisma`)

- `Ad`: título, descripción, imagen o video (upload o URL de YouTube), link opcional, `branchCategory` (para el selector de sucursal), tamaño custom de media, `fullWidth`, `shape` (`"card"` o `"circle"`), orden.
- `Catalog`: nombre, descripción, url, imagen. SOLO catálogos reales (tiendas) — siempre se muestran como tarjeta en la sección "Catálogos" de la página, ya no tiene `branch`/`category`/`showInGallery`.
- `BranchLink`: `branch`, `category`, `url`. Reemplaza el viejo truco de catálogos ocultos (`showInGallery: false`) — son los enlaces que usan los anuncios cuando preguntan la sucursal (`Ad.branchCategory` matchea contra `BranchLink.category`) y las ubicaciones de Google Maps de cada sucursal. Nunca se muestran como tarjetas. Administrados en `/admin/branch-links` (`BranchLinksManager.tsx`).
- `SocialLink`: `platform` (`whatsapp`, `instagram`, `facebook`, `tiktok`, `youtube`, `x`, `other`), url, label opcional (ej. nombre de sucursal para whatsapp), imagen custom opcional.
- `SiteSettings`: fila única (`id: "main"`) con `logoUrl` y `backgroundImageUrl` opcionales, editable desde `/admin/settings`.

## Features clave ya implementadas

- Anuncios con imagen/video/tamaño custom y selector de sucursal: si un anuncio tiene `branchCategory`, en la página pública aparece un botón "Ver más" que despliega un popover preguntando la sucursal, y lleva al `BranchLink` de esa sucursal+categoría.
- Normalización automática de URLs (`src/lib/normalize-url.ts`): completa `https://` si falta, y convierte números de teléfono sueltos en links de `wa.me` para WhatsApp.
- Columna flotante única de contacto (`src/components/WhatsappFloatingButton.tsx` + lógica en `src/app/page.tsx`): WhatsApp arriba (con selector de sucursal si hay más de un número cargado), después Instagram, después Facebook — todos del mismo tamaño, responsive (más chico en celular).
- Botón "Compartir" (`src/components/ShareButton.tsx`): usa `navigator.share` en celular (incluye WhatsApp en el menú nativo) y copia el link al portapapeles en desktop.
- Logo e imagen de fondo configurables desde `/admin/settings` (`SiteSettings`), con fallback a `/public/hero-logo.webp` si no se configura nada.
- Anuncios como botones (`Ad.shape`): con imagen y sin video, toda la tarjeta del anuncio es clickeable (como los catálogos) — ya sea un `<a>` directo (si tiene `link`) o el trigger del popover de sucursal (si tiene `branchCategory`, generalizado en `AdBranchLinkButton` vía `children`/`wrapperClassName`/`buttonClassName`). Los anuncios con video SIEMPRE se renderizan en el layout clásico (video + link "Ver más" aparte), nunca como tarjeta-botón entera, para no romper los controles del video.
- `shape: "circle"` (sin video) NO se muestra dentro de una tarjeta grande: en `page.tsx` los anuncios se parten en `circleAds`/`cardAds` (`enrichedAds` precalcula `hasVideo` por anuncio) — igual de chico que un ícono de red social, no una tarjeta con un círculo adentro. Un `shape: "circle"` con video cae automáticamente a `cardAds` (layout clásico), nunca se muestra compacto.
- Los `circleAds` se arman como `circleAdItems` (array de `{id, node}`, el `node` ya resuelto con su wrapper clickeable correspondiente — `AdBranchLinkButton`, `<a>` o `<div>`) y se renderizan en `AdCarousel` (`src/components/AdCarousel.tsx`), un carrusel horizontal deslizable (scroll-snap) ubicado entre "Catálogos" y "Anuncios y publicaciones". El ítem más cercano al centro del contenedor se resalta (más grande, opacidad completa) vía un listener de scroll que mide `getBoundingClientRect()` de cada ítem — se recalcula en cada scroll/resize, sin librería externa. Si no hay `circleAdItems`, el componente devuelve `null` y la página queda idéntica a como se veía antes de esta feature (nada de contenedor vacío). El padding lateral del carrusel (`calc(50% - 3.5rem)`) es lo que permite centrar el primer y el último ítem, no solo los del medio.
- Selector global de sucursal (`src/lib/branch-context.tsx` + `src/components/BranchSelector.tsx`): un desplegable debajo de "Compartir" donde el visitante elige su sucursal una sola vez. Se guarda en `localStorage` (vía `useSyncExternalStore`, no `useEffect` + `setState` — ese patrón dispara un error de lint nuevo, `react-hooks/set-state-in-effect`, no usarlo para esto) y queda disponible por `BranchContext` para cualquier componente cliente de la página, sin prop-drilling a través de `page.tsx` (que es un Server Component). Tanto `AdBranchLinkButton` como `WhatsappFloatingButton` leen `useBranch()`: si la sucursal elegida coincide con una de sus opciones, van directo (como `<a>` normal) sin mostrar el popover de "¿qué sucursal?". Si no hay sucursal elegida, o no coincide ninguna opción, se comportan exactamente como antes (preguntan al tocar). El `<select>` lista la unión de `Catalog.branch` y los `label` de los `SocialLink` de WhatsApp.

## ⚠️ Problema conocido: Supabase tiene cortes de conexión intermitentes

Varias veces en este proyecto, la conexión a la base de Supabase se cortó por unos segundos (a veces hasta ~1 minuto) de forma espontánea — no por un bug del código. Esto causó, en distintos momentos: la página pública caída con 500, rutas de la API fallando, el build de Vercel fallando (`prisma migrate deploy` sin poder conectar), y formularios del panel quedándose trabados en "Guardando...".

Ya se mitigó bastante, pero **puede volver a pasar** — si el usuario reporta algo similar, no asumir que es un bug nuevo, revisar primero si es este problema recurrente:

- **Reintentos en runtime**: todas las rutas de API (`src/app/api/**/route.ts`) y las páginas que leen de Prisma directamente (página pública, páginas de `/admin/*`) usan `withRetry()` de `src/lib/with-retry.ts` (2 reintentos, 500ms de espera) para tolerar cortes cortos.
- **Reintentos en el build**: `scripts/migrate-with-retry.mjs` reintenta `prisma migrate deploy` hasta 8 veces con 10s de espera (hasta 80s) antes de abortar el build.
- **Los formularios del admin ya no se quedan trabados**: `AdsManager`, `CatalogsManager`, `SocialsManager`, `SiteSettingsManager` envuelven sus guardados en try/catch/finally, así que si falla la conexión, el botón se libera y muestra un error en vez de colgarse en "Guardando...".

Si el corte dura más que estos márgenes (ej. varios minutos seguidos), ningún reintento del lado del código lo soluciona — hay que revisar del lado de Supabase: si el proyecto está pausado (plan gratis), si se llegó a algún límite de uso/ancho de banda, o si hay una caída general en `status.supabase.com`.

## Pendiente / diferido (decisión explícita del usuario, no son bugs)

- Dominio propio: el usuario eligió por ahora quedarse con el `.vercel.app` gratis en vez de comprar uno.
- Recuperar el dominio viejo `wannacos.com` (perdió el acceso): diferido.
- Google Search Console / Google Business Profile: diferido hasta definir el dominio.
