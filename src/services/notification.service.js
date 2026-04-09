import { EventEmitter } from 'node:events';

const userEvents = new EventEmitter();

// Listeners obligatorios por la práctica: user:registered, user:verified, user:invited, user:deleted
userEvents.on('user:registered', (user) => {
  console.log(`[EVENT] New register: ${user.email} (State: ${user.status})`);
});

userEvents.on('user:verified', (user) => {
  console.log(`[EVENT] Verified user: ${user.email}`);
});

userEvents.on('user:invited', (user) => {
  console.log(`[EVENT] Invited user to the company: ${user.email}`);
});

userEvents.on('user:deleted', (userId) => {
  console.log(`[EVENT] Eliminated user (ID: ${userId})`);
});

export default userEvents;