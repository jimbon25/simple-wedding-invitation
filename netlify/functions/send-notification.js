// netlify/functions/send-notification.js
// Endpoint for RSVP, guest book, and notifications
// Uses shared code from functions-shared.js
const sharedFunctions = require('./functions-shared');
exports.handler = sharedFunctions.sharedHandler;
