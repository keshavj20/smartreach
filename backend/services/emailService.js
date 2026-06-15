const nodemailer = require('nodemailer');
const Settings = require('../models/Settings');

async function getEmailConfig() {
  try {
    const settings = await Settings.find({ key: { $in: ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'smtpFrom', 'emailEnabled'] } });
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    return map;
  } catch {
    return {};
  }
}

let _transporter = null;

async function getTransporter() {
  const cfg = await getEmailConfig();

  if (cfg.emailEnabled !== 'true') return null;

  // Use Gmail if configured via env (quickest setup)
  const gmailUser = process.env.GMAIL_USER || cfg.smtpUser;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || cfg.smtpPass;

  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass }
    });
  }

  // Custom SMTP
  if (cfg.smtpHost && cfg.smtpUser && cfg.smtpPass) {
    return nodemailer.createTransport({
      host: cfg.smtpHost,
      port: parseInt(cfg.smtpPort || '587'),
      secure: cfg.smtpPort === '465',
      auth: { user: cfg.smtpUser, pass: cfg.smtpPass }
    });
  }

  return null;
}

/**
 * Send a real email to a customer.
 * Returns { sent: true/false, messageId, error }
 */
exports.sendEmail = async ({ to, toName, subject, htmlBody, textBody }) => {
  try {
    const transporter = await getTransporter();

    if (!transporter) {
      // Simulate — pretend it sent
      console.log(`[EMAIL SIMULATED] To: ${to} | Subject: ${subject}`);
      return { sent: false, simulated: true, reason: 'No email config — simulated only' };
    }

    const cfg = await getEmailConfig();
    const fromAddress = process.env.GMAIL_USER || cfg.smtpFrom || cfg.smtpUser || 'noreply@smartreach.ai';
    const fromName = 'SmartReach Store';

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: `"${toName}" <${to}>`,
      subject,
      html: htmlBody,
      text: textBody || stripHtml(htmlBody)
    });

    console.log(`[EMAIL SENT] To: ${to} | MessageId: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL FAILED] To: ${to} | Error: ${err.message}`);
    return { sent: false, simulated: false, error: err.message };
  }
};

/**
 * Verify SMTP connection
 */
exports.verifyConnection = async () => {
  try {
    const transporter = await getTransporter();
    if (!transporter) return { ok: false, reason: 'Email not configured' };
    await transporter.verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
};

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
