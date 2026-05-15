require("dotenv").config();
const OpenAI = require("openai");
const promptBuilder = require("../../utils/promptBuilder");
const systemPrompts = require("./prompts/systemPrompts");
const toolExecutor = require("./tools/toolExecutor");
const memoryManager = require("./memory/memoryManager");
const workflowEngine = require("./workflow/workflowEngine");
const aiLogger = require("./logs/aiLogger");
const aiMonitor = require("./monitoring/aiMonitor");

/**
 * Enterprise AI OS Orchestrator: The Autonomous Operational Brain
 */
class AIService {
  constructor() {
    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: { "HTTP-Referer": "http://localhost:3000", "X-Title": "Royal AI OS" },
    });

    this.models = [
      "openai/gpt-3.5-turbo", // Paid but usually very stable if key has credits
      "openai/gpt-oss-20b:free",
      "microsoft/phi-3-mini-128k-instruct:free",
      "meta-llama/llama-3-8b-instruct:free"
    ];
    this.currentModelIndex = 0;
  }

  async generateResponse(userMessage, dashboard = 'customer_dashboard', userData = {}, sessionId = 'default', metadata = {}) {
    const startTime = Date.now();
    
    // 🛡️ [AI Context Validation & Fallback]
    const safeMetadata = metadata || {};
    const safeDashboard = dashboard || safeMetadata.dashboard || 'customer_dashboard';
    const safeRole = userData?.role || safeMetadata.role || 'GUEST';

    console.log(`📡 [AI Context Received] Dashboard: ${safeDashboard}, Role: ${safeRole}`);
    if (!metadata) console.log(`⚠️ [AI Context Missing] Applying safe fallbacks.`);

    aiLogger.log('INBOUND_REQUEST', { message: userMessage, dashboard: safeDashboard, role: safeRole, metadata: safeMetadata });

    try {
      if (!userMessage?.trim()) return { success: false, message: "No input provided." };

      const history = await memoryManager.getFormattedHistory(sessionId);
      
      // 🏦 Fetch Live Business Data (Live Context)
      const liveBusinessData = await promptBuilder.buildSystemPrompt();
      
      // 🧠 Generate System Prompt with Metadata + Live Data
      const systemPrompt = systemPrompts.getCorePrompt(safeDashboard, safeRole, liveBusinessData, safeMetadata);

      for (let i = 0; i < this.models.length; i++) {
        const modelIndex = (this.currentModelIndex + i) % this.models.length;
        const model = this.models[modelIndex];

        try {
          const completion = await this.openai.chat.completions.create({
            model,
            messages: [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: userMessage.trim() }],
            max_tokens: 1000,
            temperature: 0.0,
            timeout: 20000,
          });

          const rawReply = completion.choices[0]?.message?.content;
          const result = this.parseOperationalJSON(rawReply);

          // --- 🌀 WORKFLOW ORCHESTRATION ---
          if (result.success && result.tool) {
            // Check if this is a complex workflow (defined in workflowEngine)
            const workflowName = `${result.tool}Workflow`;
            if (workflowEngine[workflowName]) {
              console.log(`🌀 [AI OS] Initiating Workflow: ${workflowName}`);
              const workflowResult = await workflowEngine[workflowName](result.data, userData.id);
              result.data = { ...result.data, ...workflowResult };
              result.message = workflowResult.success 
                ? `Done! ${workflowResult.message}` 
                : `Workflow failed: ${workflowResult.message}`;
            } else {
              // Execute single tool
              const toolResult = await toolExecutor.execute(result.tool, result.data, { dashboard: safeDashboard, user: userData });
              
              // 📋 Log REAL execution result with full DB details
              aiLogger.logAction(result.tool, result.data, toolResult, userData);
              
              // Merge tool output into result
              result.data = { ...result.data, ...toolResult };
              
              if (toolResult.success) {
                result.message = toolResult.message || 'Action completed.';
              } else {
                result.message = toolResult.message || 'No executable backend tool connected.';
              }
            }
            
          }

          // Update Monitoring & Memory
          aiMonitor.recordRequest(model, Date.now() - startTime, true);
          await memoryManager.addTurn(sessionId, "user", userMessage);
          await memoryManager.addTurn(sessionId, "assistant", result.message);

          this.currentModelIndex = modelIndex;
          return result;

        } catch (error) {
          aiLogger.logError(error, { model, i });
          if (i === this.models.length - 1) throw error;
        }
      }
    } catch (error) {
      console.error("❌ [AI OS Fatal Error]:", error.message);
      aiLogger.logError(error, { dashboard, sessionId });
      aiMonitor.recordRequest('FAILOVER', Date.now() - startTime, false);
      return { success: false, intent: "ERROR", message: "AI Brain is recalibrating. Try again. 🧠" };
    }
  }

  parseOperationalJSON(raw) {
    try {
      const jsonStart = raw.indexOf('{');
      const jsonEnd = raw.lastIndexOf('}');
      if (jsonStart === -1) throw new Error("FORMAT_ERROR");
      return JSON.parse(raw.substring(jsonStart, jsonEnd + 1));
    } catch (e) {
      return { success: true, intent: "CHAT", message: raw.replace(/\{.*\}/s, '').trim() };
    }
  }
}

module.exports = new AIService();