import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3001;
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(rootDir, 'dist'));

// Sender email config: set EMAIL_USER and EMAIL_PASS in .env
// For Gmail: use an App Password (https://myaccount.google.com/apppasswords)
const emailUser = process.env.EMAIL_USER || '';
const emailPass = process.env.EMAIL_PASS || '';

const transporter = emailUser && emailPass
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
    })
  : null;

const SEND_MAIL_TIMEOUT_MS = 25000;

app.use(cors({ origin: true }));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.get('/api/health', (req, res) => {
  res.json({ ok: true, emailConfigured: !!transporter });
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

    if (!transporter) {
      return res.status(503).json({
        error: 'Email no configurado. Añade EMAIL_USER y EMAIL_PASS en el servidor (Render → Environment).',
      });
    }

    const sendPromise = transporter.sendMail({
      from: `"Valoración" <${emailUser}>`,
      to: email,
      subject: 'Valoración de inmueble - Informe',
      text: 'Adjunto encontrará el informe de valoración en PDF y Excel.',
      html: '<p>Adjunto encontrará el informe de valoración en PDF y Excel.</p>',
      attachments: [
        { filename: pdfFile.originalname || 'valoracion.pdf', content: pdfFile.buffer },
        { filename: xlsxFile.originalname || 'valoracion.xlsx', content: xlsxFile.buffer },
      ],
    });
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
  if (!transporter) {
    console.warn('EMAIL_USER y/o EMAIL_PASS no definidos en .env — el envío por email no funcionará.');
  } else {
    console.log(`Email configurado: envíos desde ${emailUser}`);
  }
});
