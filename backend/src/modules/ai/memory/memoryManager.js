/**
 * Advanced Memory Manager: Handles persistent, multi-user context and workflow states.
 * Supports Local Map (Dev) and Redis (Prod) for enterprise scaling.
 */
class MemoryManager {
  constructor() {
    this.localCache = new Map();
    this.isRedisEnabled = false; // Set to true if redis client is initialized
    this.maxHistoryLines = 12;
  }

  /**
   * Get session data for a specific user/socket
   */
  async getSession(sessionId) {
    if (this.isRedisEnabled) {
      // Future: await redis.get(sessionId)
    }
    
    if (!this.localCache.has(sessionId)) {
      this.localCache.set(sessionId, {
        history: [],
        workflowState: {
          activeTask: null,
          pendingConfirmation: null,
          data: {}
        },
        metadata: {
          lastActive: Date.now(),
          summarized: false
        }
      });
    }
    return this.localCache.get(sessionId);
  }

  /**
   * Add a turn to the conversation history
   */
  async addTurn(sessionId, role, content) {
    const session = await this.getSession(sessionId);
    session.history.push({ role, content });

    // --- CONTEXT SUMMARIZATION LOGIC ---
    if (session.history.length > this.maxHistoryLines) {
      console.log(`🧹 [Memory] Summarizing history for session: ${sessionId}`);
      this.summarizeContext(session);
    }

    session.metadata.lastActive = Date.now();
  }

  /**
   * Simple summarization to keep tokens low
   * Removes middle messages while keeping the first (system-like context) and last few turns.
   */
  summarizeContext(session) {
    const initialTurn = session.history[0];
    const recentTurns = session.history.slice(-6);
    session.history = [initialTurn, ...recentTurns];
    session.metadata.summarized = true;
  }

  /**
   * Get formatted history for AI consumption
   */
  async getFormattedHistory(sessionId) {
    const session = await this.getSession(sessionId);
    return session.history;
  }

  /**
   * Workflow State Management: Remembers if AI is in the middle of a multi-step task
   */
  async updateWorkflow(sessionId, stateUpdate) {
    const session = await this.getSession(sessionId);
    session.workflowState = { ...session.workflowState, ...stateUpdate };
  }

  async getWorkflow(sessionId) {
    const session = await this.getSession(sessionId);
    return session.workflowState;
  }

  /**
   * Clear session on logout or disconnect
   */
  async clearSession(sessionId) {
    this.localCache.delete(sessionId);
  }
}

module.exports = new MemoryManager();
