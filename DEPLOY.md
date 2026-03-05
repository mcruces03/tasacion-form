# Guía de despliegue — Valoración de Inmueble

Esta guía te permite publicar la app en internet de forma **gratuita** para usarla desde el móvil, tablet o cualquier ordenador.

---

## Opción recomendada: Render (gratis)

[Render](https://render.com) ofrece un plan gratuito para una app Node.js. La app se “duerme” tras ~15 min sin uso (al volver a entrar tarda unos 50 segundos en despertar).

### Paso 1: Subir el proyecto a GitHub

1. Crea una cuenta en [GitHub](https://github.com) si no la tienes.
2. Crea un **nuevo repositorio** (por ejemplo `tasacion-form`). No marques “Add README” si ya tienes código local.
3. En la carpeta del proyecto, abre la terminal y ejecuta:

```bash
cd /ruta/a/tasacion-form
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/tasacion-form.git
git push -u origin main
```

(Sustituye `TU_USUARIO` por tu usuario de GitHub.)

**Importante:** No subas el archivo `.env` (tiene tu contraseña de email). Debe estar en `.gitignore`. Comprueba:

```bash
cat .gitignore | grep .env
```

Si no aparece, añade una línea con `.env` en `.gitignore`.

---

### Paso 2: Crear la cuenta en Render

1. Entra en [render.com](https://render.com) y regístrate (con GitHub es más rápido).
2. En el panel, pulsa **“New +”** → **“Web Service”**.

---

### Paso 3: Conectar el repositorio

1. Conecta tu cuenta de GitHub si te lo pide.
2. Elige el repositorio **tasacion-form** (o el nombre que hayas usado).
3. Configura el servicio así:

| Campo | Valor |
|--------|--------|
| **Name** | `tasacion-form` (o el que quieras) |
| **Region** | El más cercano a ti (ej. Frankfurt) |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

4. En **“Advanced”** (si está disponible), añade una variable de entorno:
   - **Key:** `NODE_ENV`  
   - **Value:** `production`

---

### Paso 4: Variables de entorno (email)

En el mismo servicio, ve a **“Environment”** (menú izquierdo) y añade **una** de estas opciones:

**Opción A — Enviar desde tu Gmail (sin dominio, sin pagar)**  
Los correos salen desde tu Gmail y puedes enviar a quien quieras (sin dominio). Configuración única en Google Cloud (gratis).

| Key | Value |
|-----|--------|
| `EMAIL_USER` | Tu Gmail (ej. `mcruces03@gmail.com`) |
| `GMAIL_CLIENT_ID` | De Google Cloud |
| `GMAIL_CLIENT_SECRET` | De Google Cloud |
| `GMAIL_REFRESH_TOKEN` | Con `node scripts/get-gmail-oauth-token.js` |

Guía completa más abajo: **[Enviar desde tu Gmail (Gmail OAuth2)](#enviar-desde-tu-gmail-gmail-oauth2)**.

**Opción B — Resend**  
Sin dominio verificado solo envías a tu email. Con dominio verificado, a cualquiera.

| Key | Value |
|-----|--------|
| `RESEND_API_KEY` | API key de [resend.com](https://resend.com/api-keys) |

**Opción C — Gmail con contraseña (solo local)**  
En Render suele dar timeout; solo para desarrollo.

| Key | Value |
|-----|--------|
| `EMAIL_USER` | Tu Gmail |
| `EMAIL_PASS` | [Contraseña de aplicación](https://myaccount.google.com/apppasswords) |

Guarda los cambios.

---

### Paso 5: Desplegar

1. Pulsa **“Create Web Service”**.
2. Render instalará dependencias, ejecutará `npm run build` y luego `npm start`.
3. Cuando termine, te dará una URL como:  
   `https://tasacion-form-xxxx.onrender.com`

Esa es la URL de tu app. Ábrela en el móvil o en el ordenador y ya puedes usarla.

---

### Paso 6: Comprobar el envío por email

1. En la app desplegada, rellena algo el formulario.
2. Exportar → **“Enviar por email”** → Enviar.
3. Revisa la bandeja (y spam) del email que hayas puesto como destinatario.

Si algo falla, en Render abre **“Logs”** del servicio y revisa el mensaje de error.

---

## Enviar desde tu Gmail (Gmail OAuth2)

Así puedes enviar desde tu Gmail (ej. `mcruces03@gmail.com`) en Render, **sin dominio ni Resend**. Los correos salen de tu cuenta y puedes enviar a cualquier destinatario. Es gratis (solo necesitas una cuenta de Google).

### 1. Crear proyecto en Google Cloud

1. Entra en [Google Cloud Console](https://console.cloud.google.com).
2. Crea un proyecto nuevo (o elige uno existente): **Select a project** → **New Project** → nombre ej. `tasacion-form` → **Create**.
3. En el menú (≡) ve a **APIs & Services** → **Library**. Busca **Gmail API** y actívala (**Enable**).

### 2. Crear credenciales OAuth 2.0

1. **APIs & Services** → **Credentials** → **+ Create Credentials** → **OAuth client ID**.
2. Si te pide configurar la pantalla de consentimiento:
   - **OAuth consent screen** → **External** → **Create**.
   - Rellena **App name** (ej. "Tasación Form") y **User support email** (tu Gmail). **Developer contact** = tu email. **Save and Continue**.
   - En **Scopes** → **Add or Remove Scopes** → busca `https://www.googleapis.com/auth/gmail.send` → marcar → **Update** → **Save and Continue**.
   - **Test users** → **+ Add Users** → añade tu Gmail → **Save and Continue**.
3. Vuelve a **Credentials** → **+ Create Credentials** → **OAuth client ID**.
4. **Application type**: **Web application**.
5. **Name**: ej. "Tasación".
6. En **Authorized redirect URIs** → **+ Add URI** → `http://localhost:3333/callback` → **Create**.
7. Copia el **Client ID** y el **Client secret** (los necesitas en el siguiente paso).

**Si ves "Acceso bloqueado: [Tu app] no completó el proceso de verificación de Google":**

- Para uso personal **no hace falta** verificar la app con Google. Haz esto:
  1. En [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **OAuth consent screen**.
  2. Comprueba que el **Publishing status** sea **Testing** (no "In production"). Si está en producción, haz clic en **BACK TO TESTING** para volver a modo pruebas.
  3. Baja a **Test users** → **+ ADD USERS** → añade tu Gmail (ej. `mcruces03@gmail.com`) → **Save**.
  4. Al iniciar sesión con tu Gmail, si sale la advertencia "Google no ha verificado esta app", haz clic en **Advanced** (Avanzado) → **Go to Tasacion Form (unsafe)** / **Ir a Tasacion Form (no seguro)** para continuar. Solo tú (como usuario de prueba) puedes usar la app.

### 3. Obtener el refresh token (en tu ordenador)

1. En la carpeta del proyecto, crea o edita `.env` y añade (sin subir este archivo a GitHub):

   ```
   GMAIL_CLIENT_ID=el_client_id_que_copiaste.apps.googleusercontent.com
   GMAIL_CLIENT_SECRET=el_client_secret_que_copiaste
   ```

2. En la terminal, desde la carpeta del proyecto:

   ```bash
   node scripts/get-gmail-oauth-token.js
   ```

3. Se abrirá el navegador (o te mostrará una URL). Inicia sesión con tu Gmail y acepta los permisos.
4. Al terminar, en la terminal aparecerá algo como:

   ```
   GMAIL_REFRESH_TOKEN=1//0gxxxxxxxxxxxx
   ```

   Copia ese valor (todo el token).

### 4. Configurar Render

En **Render** → tu servicio → **Environment**, añade estas variables (usa los mismos Client ID y Secret que en el paso 3, y el refresh token que acabas de obtener):

| Key | Value |
|-----|--------|
| `EMAIL_USER` | Tu Gmail (ej. `mcruces03@gmail.com`) |
| `GMAIL_CLIENT_ID` | El Client ID de Google Cloud |
| `GMAIL_CLIENT_SECRET` | El Client secret de Google Cloud |
| `GMAIL_REFRESH_TOKEN` | El token que te dio el script |

Guarda. Si el servicio ya estaba desplegado, Render volverá a desplegar solo. Si no, despliega y prueba **Enviar por email** desde la app: los correos saldrán desde tu Gmail y podrás enviar a cualquier dirección.

---

## Enviar a cualquier email (verificar dominio en Resend)

Con la cuenta gratuita de Resend, si usas `onboarding@resend.dev` **solo puedes enviar a tu propio email** (el de la cuenta de Resend). Para enviar a clientes o a cualquier dirección necesitas **verificar un dominio** y usar ese dominio en el remitente.

### Paso a paso

**1. Entra en Resend Domains**

- Abre [resend.com/domains](https://resend.com/domains).
- Inicia sesión con tu cuenta de Resend si te lo pide.

**2. Añade tu dominio**

- Pulsa **"Add Domain"**.
- Escribe el dominio que quieras usar para enviar (ej. `tudominio.com` o un subdominio como `noreply.tudominio.com`). No hace falta que sea la misma web que la app; solo se usa como remitente del correo.
- Pulsa **"Add"** o **"Verify"**.

**3. Configura los registros DNS**

Resend te mostrará unos **registros DNS** que debes crear en tu proveedor de dominio (donde compraste el dominio: GoDaddy, Namecheap, Cloudflare, Google Domains, etc.):

- Suele haber **registros MX** (para recibir correo) y a veces **TXT** (verificación).
- En el panel de tu proveedor de dominios, entra en la zona DNS del dominio (ej. `tudominio.com`).
- Crea cada registro que Resend te indique:
  - **Tipo:** MX o TXT según diga Resend.
  - **Nombre / Host:** el que te den (p. ej. algo como `send` o `@` o el subdominio).
  - **Valor / Apunta a:** el valor que te dé Resend (copia y pega tal cual).
- Guarda los cambios. La propagación DNS puede tardar **unos minutos o hasta 24–48 horas**.

**4. Verifica el dominio en Resend**

- Vuelve a [resend.com/domains](https://resend.com/domains).
- En tu dominio, pulsa **"Verify"** o **"Check DNS"**.
- Cuando Resend confirme que los registros son correctos, el dominio pasará a estado **Verified**.

**5. Elige la dirección "from" (remitente)**

- Debe ser un email **@tudominio.com** (o el subdominio que hayas verificado), por ejemplo:
  - `noreply@tudominio.com`
  - `valoracion@tudominio.com`
- No uses una dirección que no exista en ese dominio si tu proveedor lo bloquea; con `noreply@` suele bastar.

**6. Añade la variable en Render**

- En Render → tu servicio → **Environment**.
- Añade una nueva variable:
  - **Key:** `EMAIL_FROM`
  - **Value:** `Valoración <noreply@tudominio.com>`  
    (sustituye `noreply@tudominio.com` por el email que hayas elegido en tu dominio verificado).
- Guarda. Render volverá a desplegar solo; si no, haz un **Manual Deploy** para aplicar el cambio.

**7. Prueba de nuevo**

- En la app desplegada, usa **"Enviar por email"** y pon como destinatario **otro email** (no el de tu cuenta Resend).
- Debería enviarse sin el error de "solo testing emails".

### Resumen

| Dónde | Qué hacer |
|--------|------------|
| [resend.com/domains](https://resend.com/domains) | Añadir dominio → copiar registros DNS |
| Proveedor del dominio (GoDaddy, etc.) | Crear los registros MX/TXT que indique Resend |
| [resend.com/domains](https://resend.com/domains) | Pulsar Verify hasta que el dominio esté "Verified" |
| Render → Environment | Añadir `EMAIL_FROM` = `Valoración <noreply@tudominio.com>` |

Si no tienes dominio propio, puedes usar solo tu email como destinatario (el de la cuenta Resend) o valorar un dominio barato (p. ej. en Namecheap, Cloudflare, etc.) solo para el remitente del correo.

---

## Resumen de comandos que usa Render

- **Build:** `npm install && npm run build`  
  (instala dependencias y genera la carpeta `dist` del frontend.)
- **Start:** `npm start`  
  (arranca el servidor Node que sirve la API y el frontend.)

El servidor detecta que está en producción (carpeta `dist` existe) y sirve la app desde la misma URL que la API, así que no hace falta configurar CORS ni otra URL de API.

---

## Otras opciones gratuitas

- **Railway** ([railway.app](https://railway.app)): Plan gratuito con límite de uso. Flujo similar: conectar repo, definir Build = `npm install && npm run build`, Start = `npm start`, y variables `EMAIL_USER` y `EMAIL_PASS`.
- **Fly.io** ([fly.io](https://fly.io)): También tiene plan gratuito; requiere un poco más de configuración (Dockerfile o configuración en `fly.toml`). Útil si más adelante quieres más control.

Para esta app, Render suele ser la opción más sencilla.

---

## Actualizar la app después de cambios

Cada vez que quieras subir una nueva versión:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

Render detecta el push y vuelve a hacer **Build** y **Start** automáticamente. En 2–3 minutos la URL tendrá la nueva versión.

---

## Notas

- En plan gratuito de Render el servicio se duerme tras inactividad; la primera petición tras dormir puede tardar ~50 s.
- Las variables `EMAIL_USER` y `EMAIL_PASS` solo están en Render (Environment), no en el código ni en GitHub.
- Si cambias de proveedor (por ejemplo a Railway), repite los pasos de “Variables de entorno” allí con los mismos valores.
