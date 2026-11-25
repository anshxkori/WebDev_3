const EventEmitter = require('events');

class AppEventEmitter extends EventEmitter {}

const appEvents = new AppEventEmitter();

// In-memory event activity log for dashboard activity summary
const eventLogs = [];
const MAX_LOGS = 100;

const logEvent = (type, payload) => {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type,
    payload,
    timestamp: new Date().toISOString(),
  };
  eventLogs.unshift(entry);
  if (eventLogs.length > MAX_LOGS) {
    eventLogs.pop();
  }
  return entry;
};

// Event Listeners for meaningful backend events
appEvents.on('userRegistered', (data) => {
  console.log(`[EVENT: userRegistered] New user registered: ${data.username} (${data.email}) at ${new Date().toISOString()}`);
  logEvent('userRegistered', { username: data.username, email: data.email, userId: data.id });
});

appEvents.on('userLoggedIn', (data) => {
  console.log(`[EVENT: userLoggedIn] User logged in: ${data.username} at ${new Date().toISOString()}`);
  logEvent('userLoggedIn', { username: data.username, email: data.email, userId: data.id });
});

appEvents.on('noteCreated', (data) => {
  console.log(`[EVENT: noteCreated] Note created: "${data.title}" by user ${data.userId} at ${new Date().toISOString()}`);
  logEvent('noteCreated', { title: data.title, noteId: data.noteId, userId: data.userId });
});

appEvents.on('noteUpdated', (data) => {
  console.log(`[EVENT: noteUpdated] Note updated: "${data.title}" (${data.noteId}) by user ${data.userId} at ${new Date().toISOString()}`);
  logEvent('noteUpdated', { title: data.title, noteId: data.noteId, userId: data.userId });
});

appEvents.on('noteDeleted', (data) => {
  console.log(`[EVENT: noteDeleted] Note deleted: (${data.noteId}) by user ${data.userId} at ${new Date().toISOString()}`);
  logEvent('noteDeleted', { noteId: data.noteId, userId: data.userId });
});

appEvents.on('chatMessage', (data) => {
  console.log(`[EVENT: chatMessage] [${data.room}] ${data.username}: ${data.message}`);
  logEvent('chatMessage', { room: data.room, username: data.username, message: data.message });
});

module.exports = {
  appEvents,
  getRecentEvents: () => eventLogs,
};
