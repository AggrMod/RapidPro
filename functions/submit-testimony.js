const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { logger } = require('firebase-functions/v2');
const nodemailer = require('nodemailer');

const SMTP_USER = defineSecret('SMTP_USER');
const SMTP_PASS = defineSecret('SMTP_PASS');

const ALLOWED_ORIGINS = new Set([
  'https://rapidpromemphis.com',
  'https://www.rapidpromemphis.com',
  'https://rapidpro-memphis.web.app',
  'https://rapidpro-memphis.firebaseapp.com',
]);

function setCors(req, res) {
  const origin = req.get('Origin') || '';
  if (ALLOWED_ORIGINS.has(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Max-Age', '3600');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

exports.submitTestimony = onRequest(
  { region: 'us-central1', secrets: [SMTP_USER, SMTP_PASS], cors: false },
  async (req, res) => {
    setCors(req, res);

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const body = req.body || {};
    const name = String(body.name || '').trim();
    const business = String(body.business || '').trim();
    const email = String(body.email || '').trim();
    const rating = parseInt(body.rating, 10);
    const text = String(body.text || '').trim();
    const honeypot = String(body.company_url || '').trim();

    if (honeypot) {
      logger.info('Testimony submission rejected (honeypot tripped)');
      res.status(200).json({ ok: true });
      return;
    }

    if (!name || name.length > 100) {
      res.status(400).json({ error: 'Name is required (max 100 chars).' });
      return;
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) {
      res.status(400).json({ error: 'A valid email is required.' });
      return;
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5.' });
      return;
    }
    if (text.length < 20 || text.length > 2000) {
      res.status(400).json({ error: 'Testimony must be 20-2000 characters.' });
      return;
    }
    if (business.length > 120) {
      res.status(400).json({ error: 'Business field is too long.' });
      return;
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: SMTP_USER.value(), pass: SMTP_PASS.value() },
      });

      const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
      const ua = req.get('User-Agent') || 'unknown';

      await transporter.sendMail({
        from: `"RapidPro Testimony" <${SMTP_USER.value()}>`,
        to: 'RapidPro.Memphis@gmail.com',
        replyTo: email,
        subject: `New testimony from ${name} (${rating}★)`,
        text:
          `New customer testimony submitted on rapidpromemphis.com\n\n` +
          `Name: ${name}\n` +
          `Business / Title: ${business || '(not provided)'}\n` +
          `Email: ${email}\n` +
          `Rating: ${stars} (${rating}/5)\n\n` +
          `Testimony:\n${text}\n\n` +
          `---\nSubmitted from IP: ${ip}\nUser-Agent: ${ua}\n`,
        html:
          `<h2>New customer testimony</h2>` +
          `<p><strong>Name:</strong> ${escapeHtml(name)}<br>` +
          `<strong>Business / Title:</strong> ${escapeHtml(business || '(not provided)')}<br>` +
          `<strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a><br>` +
          `<strong>Rating:</strong> ${stars} (${rating}/5)</p>` +
          `<blockquote style="border-left:4px solid #facc15;padding:0.5em 1em;color:#1f2937;background:#f9fafb;">` +
          escapeHtml(text).replace(/\n/g, '<br>') +
          `</blockquote>` +
          `<hr><p style="font-size:0.85em;color:#6b7280;">IP: ${escapeHtml(String(ip))}<br>UA: ${escapeHtml(ua)}</p>`,
      });

      logger.info('Testimony emailed', { name, rating, business });
      res.status(200).json({ ok: true });
    } catch (err) {
      logger.error('Failed to send testimony email', err);
      res.status(500).json({ error: 'Failed to send testimony. Please try again later.' });
    }
  }
);
