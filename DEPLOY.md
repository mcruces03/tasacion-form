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

En el mismo servicio, ve a **“Environment”** (menú izquierdo) y añade:

| Key | Value |
|-----|--------|
| `EMAIL_USER` | Tu email (ej. `mfcruces@gmail.com`) |
| `EMAIL_PASS` | Tu contraseña de aplicación de Gmail |

Para obtener la contraseña de aplicación de Gmail:

1. [Google Account → Security](https://myaccount.google.com/security)
2. Activa **Verificación en 2 pasos** si no está activa.
3. [Contraseñas de aplicaciones](https://myaccount.google.com/apppasswords) → Crear → Elige “Correo” y genera. Copia las 16 letras (sin espacios) en `EMAIL_PASS`.

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
