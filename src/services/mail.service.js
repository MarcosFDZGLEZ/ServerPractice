import nodemailer from 'nodemailer';

const getTransportOptions = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  const service = process.env.EMAIL_SERVICE;
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 465;
  const secure = process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === 'true' : true;

  if (!user || !pass) {
    throw new Error('EMAIL_USER and EMAIL_PASSWORD must be set to send email');
  }

  if (service) {
    return {
      service,
      auth: { user, pass }
    };
  }

  return {
    host,
    port,
    secure,
    auth: { user, pass }
  };
};

const createTransporter = () => {
  const transporter = nodemailer.createTransport(getTransportOptions());
  return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) {
    throw new Error('Recipient email address is required');
  }

  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  const mailOptions = {
    from,
    to,
    subject,
    text,
    html
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
};

export const sendVerificationEmail = async (to, verificationCode) => {
  const subject = 'Verify your account';
  const text = `Your verification code is ${verificationCode}`;
  const html = `<p>Your verification code is <strong>${verificationCode}</strong>.</p><p>Use this code to verify your account.</p>`;

  return sendEmail({ to, subject, text, html });
};

export const sendInvitationEmail = async (to) => {
  const subject = 'You have been invited';
  const text = 'You have been invited to join the company. Complete your registration to get access.';
  const html = `<p>You have been invited to join the company.</p><p>Please complete your registration to get access.</p>`;

  return sendEmail({ to, subject, text, html });
};

export const sendVerifiedEmail = async (to) => {
  const subject = 'Email verified';
  const text = 'Your email has been successfully verified.';
  const html = '<p>Your email has been successfully verified.</p>';

  return sendEmail({ to, subject, text, html });
};
