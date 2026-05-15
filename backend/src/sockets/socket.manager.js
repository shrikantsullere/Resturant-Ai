const { Server } = require('socket.io');
const aiService = require('../modules/ai/ai.service');

let io; // Global IO instance
const aiCooldowns = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // In production, replace with your frontend URL
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // --- AI CHAT EVENTS ---
    socket.on('ai_message', async (data) => {
      const userId = socket.id;
      const now = Date.now();
      const cooldownMs = 3000;

      try {
        if (!data || !data.message || data.message.trim().length === 0) {
          return socket.emit('ai_error', { message: 'Message cannot be empty' });
        }

        if (aiCooldowns.has(userId) && (now - aiCooldowns.get(userId) < cooldownMs)) {
          return socket.emit('ai_error', { message: 'Please wait a moment before sending another message.' });
        }
        // 🧠 AI Message Interaction
        try {
          const { message, dynamicContext, sessionId } = data;
          
          // 🛡️ [AI Context Fallback Applied]
          const safeContext = dynamicContext || { dashboard: 'customer_dashboard', role: 'GUEST' };
          if (!dynamicContext) console.log(`[AI Context Fallback Applied] for session ${sessionId}`);

          const response = await aiService.generateResponse(
            message, 
            safeContext.dashboard, 
            { role: safeContext.role, id: socket.userId }, 
            sessionId || socket.id,
            safeContext // Passing full metadata as the 5th argument
          );
          
          socket.emit('ai_response', response);
        } catch (error) {
          console.error('AI Socket Error:', error);
          socket.emit('ai_response', { success: false, message: "Brain overload. Try again later." });
        }
      } catch (error) {
        console.error('❌ Socket AI Error:', error);
        socket.emit('ai_reply', { success: false, message: 'AI assistant is temporarily unavailable.' });
      } finally {
        socket.emit('ai_typing', false);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      aiCooldowns.delete(socket.id);
    });
  });

  return io;
};

// Export getIO to be used in services
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Please call initSocket first.');
  }
  return io;
};

module.exports = { initSocket, getIO };
