const EventEmitter = require('events');

class AppEventEmitter extends EventEmitter {}

const appEvents = new AppEventEmitter();

appEvents.on('user:registered', (user) => {
  console.log(`[EVENT] user:registered -> ${user.username} (${user.email})`);
});

appEvents.on('user:login', (user) => {
  console.log(`[EVENT] user:login -> ${user.username} logged in`);
});

appEvents.on('note:created', (note) => {
  console.log(`[EVENT] note:created -> "${note.title}" by ${note.owner}`);
});

appEvents.on('note:deleted', (noteId, userId) => {
  console.log(`[EVENT] note:deleted -> ${noteId} by ${userId}`);
});

module.exports = appEvents;