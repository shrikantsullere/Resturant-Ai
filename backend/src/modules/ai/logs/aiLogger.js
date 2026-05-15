const fs = require('fs');
const path = require('path');

/**
 * Enterprise AI Audit Logger: Tracks every autonomous action for compliance and debugging.
 */
class AILogger {
  constructor() {
    this.logDir = path.join(__dirname, '../../../../logs/ai');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Log an AI Operational Event
   */
  log(event, data) {
    const timestamp = new Date().toISOString();
    const logEntry = JSON.stringify({ timestamp, event, ...data }) + '\n';
    
    // Log to console for dev
    console.log(`📝 [AI Audit] ${event}:`, JSON.stringify(data, null, 2));

    // Write to audit file
    const logFile = path.join(this.logDir, `ai-audit-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, logEntry);
  }

  /**
   * Log an Autonomous Action
   */
  logAction(tool, params, toolResult, user) {
    this.log('ACTION_EXECUTED', {
      message: `tool=${tool} | success=${toolResult.success} | affectedRows=${toolResult.affectedRows ?? 'N/A'}`,
      tool,
      entities: params,
      success: toolResult.success,
      affectedRows: toolResult.affectedRows ?? null,
      backendMessage: toolResult.message || null,
      userId: user?.id,
      role: user?.role
    });
  }

  /**
   * Log System Error
   */
  logError(error, context) {
    this.log('SYSTEM_ERROR', {
      message: error.message,
      stack: error.stack,
      context
    });
  }
}

module.exports = new AILogger();
