const aiService = require('./ai.service');
const { sendSuccess, sendError } = require('../../utils/response.formatter');

/**
 * AI Controller: Handles RESTful AI Chat requests
 */
class AIController {
  /**
   * Main Chat Endpoint
   */
  async chat(req, res) {
    try {
      const { message, dashboard } = req.body;
      const user = req.user; // From JWT middleware

      if (!message) {
        return sendError(res, 'Message is required', 400);
      }

      // Generate AI Response with full context
      const result = await aiService.generateResponse(
        message,
        dashboard || 'customer_dashboard',
        { 
          id: user.id, 
          role: user.role_name || user.role, 
          name: user.name 
        },
        `rest-${user.id}` // Session key for REST calls
      );

      return sendSuccess(res, 'AI responded successfully', result);
    } catch (err) {
      console.error('❌ AI Controller Error:', err.message);
      return sendError(res, 'AI Assistant is currently busy. Please try again.');
    }
  }
}

module.exports = new AIController();
