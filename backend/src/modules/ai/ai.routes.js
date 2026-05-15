const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

/**
 * AI Routes: Secure endpoints for the Hospitality AI OS
 */

// Main Chat Route: JWT protected
router.post('/chat', authenticate, aiController.chat);

// Future: Admin routes for AI usage logs or settings
// router.get('/logs', authenticate, authorize(['admin']), aiController.getLogs);

module.exports = router;
