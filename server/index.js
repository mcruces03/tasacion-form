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
    })
  : null;

app.use(cors({ origin: true }));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.post('/api/send-report', upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'xlsx', maxCount: 1 }]), async (req, res) => {
  try {
    const email = (req.body.email || '').trim();
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
        error: 'Email no configurado. Añade EMAIL_USER y EMAIL_PASS en el archivo .env',
      });
    }

    await transporter.sendMail({
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

    res.json({ success: true, message: 'Informe enviado correctamente' });
  } catch (err) {
    console.error('Email error:', err);
    const message = err.message || 'Error al enviar el email';
    res.status(500).json({ error: message });
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  if (!transporter) {
    console.warn('EMAIL_USER y/o EMAIL_PASS no definidos en .env — el envío por email no funcionará.');
  } else {
    console.log(`Email configurado: envíos desde ${emailUser}`);
  }
});
