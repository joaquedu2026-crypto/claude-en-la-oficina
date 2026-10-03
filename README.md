# Anuncios y catálogos

Sitio web con:

- **Página pública** (`/`): muestra anuncios/publicaciones (texto, imagen o video) y accesos directos a catálogos.
- **Panel de administración** (`/admin`): protegido con contraseña, permite agregar, editar, ocultar y eliminar anuncios y catálogos, con subida de imágenes.

Hecho con Next.js, Tailwind CSS y Prisma + SQLite (una base de datos local en un solo archivo, sin servicios externos).

## Cómo correrlo en tu computadora

1. Instalá [Node.js](https://nodejs.org) (versión 20 o superior).
2. Cloná el repositorio y entrá a la carpeta del proyecto.
3. Instalá las dependencias:

   ```bash
   npm install
   ```

4. Creá un archivo `.env` en la raíz del proyecto (no se sube a git) con este contenido:

   ```bash
   DATABASE_URL="file:./dev.db"
   ADMIN_PASSWORD="elegí-una-contraseña-segura"
   SESSION_SECRET="una-cadena-larga-y-aleatoria"
   ```

   Podés generar un `SESSION_SECRET` aleatorio con:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. Creá la base de datos (solo la primera vez, o cuando cambie el esquema):

   ```bash
   npx prisma migrate dev
   ```

6. Iniciá el servidor:

   ```bash
   npm run dev
   ```

7. Abrí [http://localhost:3000](http://localhost:3000) para el sitio público, y [http://localhost:3000/admin](http://localhost:3000/admin) para el panel de administración (usá la contraseña de `ADMIN_PASSWORD`).

## Notas importantes

- **Cambiá `ADMIN_PASSWORD`** antes de usar el sitio en serio — el valor por defecto usado durante el desarrollo no es seguro.
- Los datos (anuncios, catálogos) quedan guardados en `prisma/dev.db`. Hacé una copia de ese archivo si querés respaldar el contenido.
- Las imágenes subidas se guardan en `public/uploads/`.
- Para publicar el sitio en internet (no solo en tu computadora), podés desplegarlo en un servicio como Vercel, Railway o un VPS propio — avisame si querés ayuda con eso.

## Producción

```bash
npm run build
npm start
```
