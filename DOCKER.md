# Docker / Docker Compose

Instrucciones rápidas para construir y ejecutar la aplicación (frontend + backend) con Docker Compose.


Opciones para usar variables de entorno (elige una):

- Usar variables de entorno del sistema (recomendado si ya las tienes configuradas):

   - Asegúrate de que las variables están definidas en tu shell: por ejemplo

      export SUPABASE_URL="..."
      export SUPABASE_SERVICE_ROLE_KEY="..."
      export GMAIL_USER="..."
      export GMAIL_APP_PASSWORD="..."
      export VITE_SUPABASE_URL="..."
      export VITE_SUPABASE_PUBLISHABLE_KEY="..."

   - Luego ejecuta:

      docker compose up --build

- Usar archivo `.env` (si prefieres no exportar en el shell):

   - Copia el ejemplo y edita:

      cp .env.example .env

   - Rellena los valores y luego ejecuta:

      docker compose up --build

3) Servicios expuestos:

    - Backend: http://localhost:4000 (rutas API expuestas bajo /api/*)
    - Frontend: http://localhost:3000 (sitio estático servido por nginx)

3) Servicios expuestos:

   - Backend: http://localhost:4000 (rutas API expuestas bajo /api/*)
   - Frontend: http://localhost:3000 (sitio estático servido por nginx)

Notas:

Notas:

- El backend requiere las credenciales de Supabase y Gmail. No las incluyas en el repositorio.
- Para que Vite incluya las variables en el build, `VITE_*` debe estar disponible en tiempo de build (el `docker-compose.yml` pasa esas variables como build-args desde el entorno del host).
- Si no quieres usar variables de entorno del host, copia `.env.example` a `.env` y edítalo; `docker compose` leerá esas variables para las sustituciones.

