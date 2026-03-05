import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3001;
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(rootDir, 'dist'));

// Email: Resend (opcional; si no hay dominio verificado solo envía a tu email)
const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const emailFrom = process.env.EMAIL_FROM || 'Valoración <onboarding@resend.dev>';

const emailUser = (process.env.EMAIL_USER || '').trim();

// Gmail OAuth2 — funciona desde Render; envía desde tu Gmail sin dominio ni Resend
const gmailClientId = process.env.GMAIL_CLIENT_ID || '';
const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET || '';
const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN || '';
const gmailOauthTransporter =
  !resend && emailUser && gmailClientId && gmailClientSecret && gmailRefreshToken
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: emailUser,
          clientId: gmailClientId,
          clientSecret: gmailClientSecret,
          refreshToken: gmailRefreshToken,
        },
        connectionTimeout: 20000,
        greetingTimeout: 15000,
        socketTimeout: 45000,
      })
    : null;

// Fallback: Nodemailer con contraseña (solo en local; en Render suele dar "Connection timeout")
const emailPass = process.env.EMAIL_PASS || '';
const transporter =
  !resend && !gmailOauthTransporter && emailUser && emailPass
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: { user: emailUser, pass: emailPass },
        connectionTimeout: 15000,
        greetingTimeout: 10000,
      })
    : null;

const emailConfigured = !!(resend || gmailOauthTransporter || transporter);
// Gmail OAuth + Render: primera vez puede tardar (token refresh + conexión); dar margen
const SEND_MAIL_TIMEOUT_MS = 55000;

app.use(cors({ origin: true }));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.get('/api/health', (req, res) => {
  res.json({ ok: true, emailConfigured });
});

app.post('/api/send-report', (req, res, next) => {
  upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'xlsx', maxCount: 1 }])(req, res, (multerErr) => {
    if (multerErr) {
      console.error('Multer error:', multerErr);
      return res.status(400).json({
        error: multerErr.code === 'LIMIT_FILE_SIZE' ? 'Archivos demasiado grandes (máx. 10 MB)' : 'Error al subir archivos',
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    const email = (req.body?.email || '').trim();
    if (!email) {
      return res.status(400).json({ error: 'Email es obligatorio' });
    }
    const pdfFile = req.files?.pdf?.[0];
    const xlsxFile = req.files?.xlsx?.[0];
    if (!pdfFile || !xlsxFile) {
      return res.status(400).json({ error: 'Faltan archivos PDF o Excel' });
    }

    if (!emailConfigured) {
      return res.status(503).json({
        error: 'Email no configurado. En Render: GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET + GMAIL_REFRESH_TOKEN + EMAIL_USER (ver DEPLOY.md), o RESEND_API_KEY.',
      });
    }

    const subject = 'Valoración de inmueble - Informe';
    const text = 'Adjunto encontrará el informe de valoración en PDF y Excel.';
    const html = '<p>Adjunto encontrará el informe de valoración en PDF y Excel.</p>';
    const attachments = [
      { filename: pdfFile.originalname || 'valoracion.pdf', content: pdfFile.buffer },
      { filename: xlsxFile.originalname || 'valoracion.xlsx', content: xlsxFile.buffer },
    ];

    let sendPromise;
    if (resend) {
      sendPromise = resend.emails.send({
        from: emailFrom,
        to: [email],
        subject,
        text,
        html,
        attachments,
      }).then(({ data, error }) => {
        if (error) throw new Error(error.message || 'Resend error');
        return data;
      });
    } else {
      const transport = gmailOauthTransporter || transporter;
      const sendStart = Date.now();
      console.log('Send-mail: iniciando envío (Gmail OAuth/Nodemailer)...');
      sendPromise = transport.sendMail({
        from: `"Valoración" <${emailUser}>`,
        to: email,
        subject,
        text,
        html,
        attachments,
      }).then((result) => {
        console.log(`Send-mail: envío completado en ${Date.now() - sendStart} ms`);
        return result;
      });
    }
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout enviando el email. Vuelve a intentarlo.')), SEND_MAIL_TIMEOUT_MS)
    );
    await Promise.race([sendPromise, timeoutPromise]);

    res.json({ success: true, message: 'Informe enviado correctamente' });
  } catch (err) {
    console.error('Send-report error:', err?.message || err);
    if (err?.stack) console.error(err.stack);
    const code = (err?.code || '').toLowerCase();
    const msg = err?.message || '';
    let userMessage = 'Error al enviar el email. Revisa los logs en Render.';
    if (code === 'eauth' || msg.includes('Invalid login') || msg.includes('authentication')) {
      userMessage = 'Email no configurado correctamente. Usa una Contraseña de aplicación de Gmail (no la contraseña normal).';
    } else if (msg.includes('Timeout')) {
      userMessage = msg;
    } else if (msg && msg.length < 120) {
      userMessage = msg;
    }
    res.status(500).json({ error: userMessage });
  }
});

// En producción, servir el frontend (Vite build) y SPA fallback
if (isProduction) {
  const distPath = path.join(rootDir, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err?.message || err);
  if (err?.stack) console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  if (resend) {
    console.log('Email configurado (Resend). Envíos desde:', emailFrom);
  } else if (gmailOauthTransporter) {
    console.log('Email configurado (Gmail OAuth2). Envíos desde:', emailUser);
  } else if (transporter) {
    console.log('Email configurado (Nodemailer). Envíos desde:', emailUser);
  } else {
    console.warn('Email no configurado. Ver DEPLOY.md: Gmail OAuth2 o Resend.');
  }
});
