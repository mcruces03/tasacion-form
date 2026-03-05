/**
 * One-time script to get a Gmail OAuth2 refresh token.
 * Run: node scripts/get-gmail-oauth-token.js
 * Requires in .env: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET
 * Add http://localhost:3333/callback as redirect URI in Google Cloud Console.
 */
import 'dotenv/config';
import http from 'http';
import { URL } from 'url';
import { exec } from 'child_process';

const PORT = 3333;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPE = 'https://www.googleapis.com/auth/gmail.send';

const clientId = process.env.GMAIL_CLIENT_ID?.trim();
const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();

if (!clientId || !clientSecret) {
  console.error('Falta .env con GMAIL_CLIENT_ID y GMAIL_CLIENT_SECRET.');
  console.error('Cópialos desde Google Cloud Console → APIs & Services → Credentials.');
  process.exit(1);
}

const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.set('client_id', clientId);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', SCOPE);
authUrl.searchParams.set('access_type', 'offline');
authUrl.searchParams.set('prompt', 'consent');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  if (url.pathname !== '/callback') {
    res.writeHead(302, { Location: authUrl.toString() });
    res.end();
    return;
  }
  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<p>No se recibió código. Vuelve a ejecutar el script y autoriza de nuevo.</p>');
    return;
  }
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const data = await tokenRes.json();
    if (data.error) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<p>Error: ${data.error}</p><pre>${JSON.stringify(data, null, 2)}</pre>`);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(
      '<p><strong>Listo.</strong> Ya tienes el refresh token. Puedes cerrar esta pestaña.</p>' +
        '<p>Cópialo en Render → Environment como <code>GMAIL_REFRESH_TOKEN</code></p>'
    );
    console.log('\n--- Añade esto en Render (Environment) ---\n');
    console.log('GMAIL_REFRESH_TOKEN=' + data.refresh_token);
    console.log('\nTambién pon EMAIL_USER=tu_gmail@gmail.com\n');
  } catch (e) {
    console.error(e);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error: ' + e.message);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(PORT, () => {
  console.log('Abre esta URL en el navegador e inicia sesión con tu Gmail:\n');
  console.log(authUrl.toString());
  console.log('\nEsperando autorización en http://localhost:' + PORT + '/callback ...');
  try {
    const open = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(open + ' "' + authUrl.toString() + '"', () => {});
  } catch (_) {}
});
