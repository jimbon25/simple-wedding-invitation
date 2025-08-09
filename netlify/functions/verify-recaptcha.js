// netlify/functions/verify-recaptcha.js
// Endpoint for reCAPTCHA verification and notification
// Uses shared code from functions-shared.js
const sharedFunctions = require('./functions-shared');
exports.handler = sharedFunctions.sharedHandler;
