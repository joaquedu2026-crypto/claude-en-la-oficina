# Anuncios y catálogos — Wanna Cosmetics

Sitio web con:

- **Página pública** (`/`): anuncios/publicaciones (texto, imagen o video), accesos directos a catálogos, y enlaces a redes sociales/contacto.
- **Panel de administración** (`/admin`): protegido con contraseña, para gestionar todo el contenido.

Hecho con Next.js, Tailwind CSS, Prisma (PostgreSQL) y Vercel Blob para las imágenes — pensado para desplegarse gratis en Vercel.

## Publicar el sitio en internet (para que cualquiera pueda entrar)

Se usan tres servicios, todos con plan gratuito:

### 1. Crear la base de datos (Neon)

1. Entrá a [neon.tech](https://neon.tech) y creá una cuenta gratis (podés usar tu cuenta de GitHub).
2. Creá un proyecto nuevo (cualquier nombre, por ejemplo "wanna-cosmetics").
3. Copiá el **connection string** que te muestra (empieza con `postgresql://...`). Lo vas a necesitar en el paso 2.

### 2. Crear el proyecto en Vercel

1. Entrá a [vercel.com](https://vercel.com) y creá una cuenta con tu mismo usuario de GitHub.
2. Hacé clic en **Add New → Project** e importá el repositorio `claude-en-la-oficina`.
3. Elegí qué rama desplegar (podés pedirme que fusione los cambios a `main` antes de este paso).
4. Antes de hacer clic en "Deploy", abrí **Environment Variables** y agregá:
   - `DATABASE_URL` → el connection string de Neon del paso 1.
   - `ADMIN_PASSWORD` → la contraseña que quieras para el panel.
   - `SESSION_SECRET` → una cadena larga y aleatoria (podés generarla en [random.org](https://www.random.org/strings/) o pedirme una).
5. Hacé clic en **Deploy**.

### 3. Crear el almacenamiento de imágenes (Vercel Blob)

1. Dentro de tu proyecto ya creado en Vercel, andá a la pestaña **Storage**.
2. Hacé clic en **Create Database** y elegí **Blob**.
3. Conectalo a tu proyecto (Vercel agrega automáticamente la variable `BLOB_READ_WRITE_TOKEN`).
4. Volvé a la pestaña **Deployments** y hacé **Redeploy** del último despliegue para que tome la nueva variable.

Listo — tu sitio va a estar disponible en una dirección tipo `tu-proyecto.vercel.app`, accesible para cualquiera. Si tenés un dominio propio, se agrega en **Settings → Domains** dentro de Vercel.

## Cómo seguir trabajando en tu computadora (desarrollo local)

1. Instalá [Node.js](https://nodejs.org) (versión 20 o superior) y [Git](https://git-scm.com/download/win).
2. Cloná el repositorio y entrá a la carpeta del proyecto.
3. Instalá las dependencias:
   ```bash
   npm install
   ```
4. Creá un archivo `.env` en la raíz del proyecto con:
   ```bash
   DATABASE_URL="el-connection-string-de-neon"
   ADMIN_PASSWORD="tu-contraseña"
   SESSION_SECRET="una-cadena-larga-aleatoria"
   BLOB_READ_WRITE_TOKEN="el-token-de-vercel-blob"
   ```
   El `DATABASE_URL` puede ser el mismo de Neon que usás en producción, o podés crear una segunda base en Neon solo para pruebas.
   El `BLOB_READ_WRITE_TOKEN` se obtiene desde Vercel: **Storage → tu Blob store → pestaña .env.local** (copiá el valor de ahí).
5. Aplicá las migraciones:
   ```bash
   npx prisma migrate deploy
   ```
6. Iniciá el servidor:
   ```bash
   npm run dev
   ```
7. Abrí [http://localhost:3000](http://localhost:3000).

## Notas importantes

- Nunca compartas el archivo `.env` ni subas sus valores a GitHub (ya está excluido por `.gitignore`).
- Los anuncios, catálogos y redes sociales quedan guardados en la base de datos de Neon — podés verlos/respaldarlos desde el panel de Neon.
- Las imágenes se guardan en Vercel Blob, accesibles desde cualquier parte del mundo sin depender de tu computadora.

## Producción (build manual)

```bash
npm run build
npm start
```
