import { EventEmitter } from 'node:events';
import {
  sendInvitationEmail,
  sendVerificationEmail,
  sendVerifiedEmail
} from './mail.service.js';

const userEvents = new EventEmitter();
const emailEnabled = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

const safeSend = async (fn, to, ...args) => {
  if (!emailEnabled) {
    console.warn('[MAIL] Email sending is disabled; skipped sending message to', to);
    return;
  }

  try {
    await fn(to, ...args);
  } catch (error) {
    console.error(`[MAIL] Failed to send email to ${to}:`, error);
  }
};

// Listeners obligatorios por la práctica: user:registered, user:verified, user:invited, user:deleted
userEvents.on('user:registered', (user) => {
  console.log(`[EVENT] New register: ${user.email} (State: ${user.status})`);
  safeSend(sendVerificationEmail, user.email, user.verificationCode);
});

userEvents.on('user:verified', (user) => {
  console.log(`[EVENT] Verified user: ${user.email}`);
  safeSend(sendVerifiedEmail, user.email);
});

userEvents.on('user:invited', (user) => {
  console.log(`[EVENT] Invited user to the company: ${user.email}`);
  safeSend(sendInvitationEmail, user.email);
});

userEvents.on('user:deleted', (userId) => {
  console.log(`[EVENT] Eliminated user (ID: ${userId})`);
});

export default userEvents;