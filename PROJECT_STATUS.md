# Estado del proyecto — Wanna Cosmetics

Este archivo es un resumen para que cualquier sesión de Claude Code (local o en la nube) entienda el estado actual del proyecto sin que el usuario tenga que reexplicarlo. Se actualiza a medida que se agregan features o se resuelven problemas importantes.

## Qué es

Sitio web de la marca de cosméticos "Wanna Cosmetics" (sucursales en Rio Grande y Rio Gallegos, Argentina):

- **Página pública** (`/`): anuncios/publicaciones, catálogos, logo y fondo configurables, botón de compartir, y una columna flotante de contacto (WhatsApp → Instagram → Facebook, en ese orden, mismo tamaño).
- **Panel de administración** (`/admin`): protegido con contraseña. Secciones: Anuncios, Catálogos, Redes y contacto, Apariencia (logo + fondo).

## Stack técnico

- Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4.
- Prisma ORM v5.22 + PostgreSQL alojado en **Neon** (vía la integración de Storage de Vercel — hasta el 6/10/2026 estuvo en Supabase, migrado por cortes de conexión intermitentes recurrentes, ver sección de historial más abajo).
- Subida de imágenes/videos: Vercel Blob (`@vercel/blob`), vía upload server-side en `/api/upload`.
- Autenticación admin: cookie HMAC-firmada (`src/lib/auth.ts`), sin usuarios/roles, solo una contraseña (`ADMIN_PASSWORD`).

## Despliegue

- Proyecto de Vercel: **wanna-cosmetics**. URL pública: `https://wanna-cosmetics.vercel.app`.
- **Importante**: Vercel despliega en producción desde la rama `claude/modest-clarke-8trpfz`, **no desde `main`**. Cualquier trabajo nuevo debe pushearse a esa rama (o cambiar la rama de producción en Vercel si se decide mergear a main en algún momento).
- Variables de entorno (configuradas en Vercel, no están en el repo): `DATABASE_URL` (connection string **pooled** de Neon), `DIRECT_URL` (connection string **directa/sin pooling** de Neon, usada por Prisma solo para migraciones — ver `directUrl` en `prisma/schema.prisma`), `ADMIN_PASSWORD`, `SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN`. La base de Neon se creó y conectó desde el proyecto de Vercel (Storage tab), no hace falta cuenta separada en neon.tech para administrarla.
- Build command: `npm run build` → corre `node scripts/migrate-with-retry.mjs && next build` (ver sección de problema conocido más abajo — documentada para Supabase, pero el mismo mecanismo de reintentos sigue aplicando con Neon si hubiera cortes).

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
- `AdCarousel` soporta mouse en desktop además de touch: drag manual (pointer events, con un umbral de 5px antes de considerarlo arrastre, para no interferir con los clicks normales de cada ítem) y rueda del mouse mapeada a scroll horizontal (`wheel` → `scrollLeft`). El touch en celular sigue siendo el scroll nativo, sin tocar.
- Logo del sitio (`public/hero-logo.webp`, fallback cuando `SiteSettings.logoUrl` no está seteado): es el wordmark real de la marca ("wanna·cosmetics" + "belleza profesional" + los dos corazones en violeta), recortado del arte original que subió el usuario y con el fondo (antes negro sólido) convertido a transparente, para que se vea la imagen de fondo del sitio detrás. Ya NO es la versión con la "W" grande ni la foto de una modelo que tuvo en versiones anteriores — esas quedaron descartadas explícitamente porque el usuario las fue reemplazando.
- Ícono del sitio (favicon + ícono de app): `src/app/icon.png` (192×192), `src/app/apple-icon.png` (180×180, para "agregar a pantalla de inicio" en iOS), `src/app/favicon.ico` (16/32/48, pestaña del navegador) y `src/app/manifest.ts` (con `public/icons/icon-192.png` y `icon-512.png`, para Android/PWA) — todos son la "w" minúscula + los dos corazones recortados directamente del arte real del logo (no una fuente parecida: se probó con Poppins y con Quicksand, pero el usuario pidió explícitamente la tipografía exacta del logo, así que se terminó recortando la "w" y los corazones del PNG original), en blanco sobre un cuadrado redondeado violeta (`#5a1d5f`). El contenido queda con margen de sobra (dentro de la "zona segura" del 80% central) para no cortarse bajo máscaras circulares que aplican algunos Android/iOS al ícono de la pantalla de inicio — esto importa si se vuelve a regenerar el ícono: siempre dejar margen generoso, no pegar el glifo a los bordes. `viewport.themeColor` en `src/app/layout.tsx` usa el mismo violeta.

## ⚠️ Historial: cortes de conexión intermitentes con Supabase (ya migrado a Neon)

Durante la primera etapa del proyecto (hasta el 6/10/2026) la base estuvo en Supabase, y varias veces la conexión se cortó por unos segundos (a veces hasta ~1 minuto) de forma espontánea — no por un bug del código. Esto causó, en distintos momentos: la página pública caída con 500, rutas de la API fallando, el build de Vercel fallando (`prisma migrate deploy` sin poder conectar), y formularios del panel quedándose trabados en "Guardando...". Por eso se migró la base a **Neon** (ver sección de Stack técnico y Despliegue) — la causa era infraestructura de Supabase, no el código.

Las mitigaciones que se agregaron en ese momento son genéricas (sirven ante cualquier corte transitorio de conexión a la base, sea cual sea el proveedor) y se mantienen tal cual con Neon — si el usuario reporta algo similar (sitio caído, formulario trabado en "Guardando..."), no asumir que es un bug nuevo, revisar primero si es un corte transitorio de este tipo:

- **Reintentos en runtime**: todas las rutas de API (`src/app/api/**/route.ts`) y las páginas que leen de Prisma directamente (página pública, páginas de `/admin/*`) usan `withRetry()` de `src/lib/with-retry.ts` (2 reintentos, 500ms de espera) para tolerar cortes cortos.
- **Reintentos en el build**: `scripts/migrate-with-retry.mjs` reintenta `prisma migrate deploy` hasta 8 veces con 10s de espera (hasta 80s) antes de abortar el build.
- **Los formularios del admin ya no se quedan trabados**: `AdsManager`, `CatalogsManager`, `SocialsManager`, `SiteSettingsManager` envuelven sus guardados en try/catch/finally, así que si falla la conexión, el botón se libera y muestra un error en vez de colgarse en "Guardando...".

Si el corte dura más que estos márgenes (ej. varios minutos seguidos), ningún reintento del lado del código lo soluciona — hay que revisar el dashboard de Neon (límites de uso/cómputo del plan gratis, o estado general en `neonstatus.com`).

## Otro proyecto del usuario (NO es este repo)

El usuario también tiene un catálogo de productos aparte, en `catalogo-wannacosmetic.onrender.com` (Render, no Vercel), que maneja con otra sesión de Claude Code local — **no está conectado a esta sesión ni a este repositorio**. Si pide cambios ahí, no se pueden hacer desde acá; como mucho, dar indicaciones (colores de marca, tipografía, criterios de diseño) para que las aplique en esa otra sesión.

## Pendiente / diferido (decisión explícita del usuario, no son bugs)

- Dominio propio: el usuario eligió por ahora quedarse con el `.vercel.app` gratis en vez de comprar uno.
- Recuperar el dominio viejo `wannacos.com` (perdió el acceso): diferido.
- Google Search Console / Google Business Profile: diferido hasta definir el dominio.
