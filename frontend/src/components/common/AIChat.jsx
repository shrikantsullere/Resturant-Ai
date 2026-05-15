import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useOrders } from '../../context/OrdersContext';
import { useHospitality } from '../../context/HospitalityContext';
import { useMenu } from '../../context/MenuContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './AIChat.css';

// Reuse the existing socket logic or create a dedicated one for AI
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: 'Hello! I am your Royal AI assistant. How can I help you today? 🍽️' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  
  const { addOrder } = useOrders();
  const { addReservation, addTask, approveReservation } = useHospitality();
  const { items: menuItems } = useMenu();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // --- DASHBOARD & PAGE CONTEXT DETECTION ---
  const getAIContext = () => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    let dashboard = 'customer_dashboard';
    let activeModule = 'general';
    let currentMenu = 'home';

    if (path.includes('/manager')) {
      dashboard = 'manager_dashboard';
      activeModule = 'management';
    } else if (path.includes('/admin')) {
      dashboard = 'admin_dashboard';
      activeModule = 'administration';
    } else if (path.includes('/kitchen')) {
      dashboard = 'kitchen_dashboard';
      activeModule = 'kitchen';
    } else if (path.includes('/cashier')) {
      dashboard = 'cashier_dashboard';
      activeModule = 'billing';
    } else if (path.includes('/reception')) {
      dashboard = 'reception_dashboard';
      activeModule = 'hospitality';
    }

    // Attempt to extract menu from path segments
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 1) {
      currentMenu = segments[segments.length - 1];
    }

    return {
      dashboard,
      activeModule,
      currentMenu,
      currentPage: path,
      params: Object.fromEntries(searchParams.entries())
    };
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [chatHistory, isOpen, isTyping]);

  // Socket Initialization
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socketRef.current.on('ai_reply', async (data) => {
      if (data.success) {
        const replyText = data.reply || data.message;
        setChatHistory(prev => [...prev, { role: 'assistant', text: replyText }]);
        
        // --- TEXT TO SPEECH (TTS) ---
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(replyText);
          utterance.lang = 'hi-IN'; // Support Hindi/Hinglish
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
        }

        // --- OPERATIONAL ACTIONS ---
        if (data.intent && data.data) {
          try {
            console.log(`🤖 [AI OS] Executing Action: ${data.intent}`, data.data);
            
            switch (data.intent) {
              case 'CREATE_ORDER':
                // Map names to IDs
                const orderItems = data.data.items.map(aiItem => {
                  const found = menuItems.find(mi => 
                    mi.name.toLowerCase().includes(aiItem.name.toLowerCase())
                  );
                  return found ? { ...found, qty: aiItem.qty || 1 } : null;
                }).filter(Boolean);

                if (orderItems.length > 0) {
                  await addOrder(orderItems, { 
                    tableId: data.data.tableId,
                    type: 'dine-in',
                    userId: user?.id
                  });
                  showToast('Order successfully sent to kitchen! 🍕', 'success');
                }
                break;

              case 'CREATE_ROOM_BOOKING':
              case 'CREATE_TABLE_BOOKING':
                await addReservation({
                  ...data.data,
                  type: data.intent === 'CREATE_ROOM_BOOKING' ? 'room' : 'table',
                  guestId: user?.id
                });
                showToast('Booking confirmed! 🗓️', 'success');
                break;

              case 'ROOM_SERVICE_REQUEST':
              case 'HOUSEKEEPING_REQUEST':
              case 'LAUNDRY_REQUEST':
                await addTask({
                  title: data.intent.replace('_', ' '),
                  description: data.message,
                  status: 'pending',
                  priority: 'medium'
                });
                showToast('Staff notified! 🛎️', 'success');
                break;

              // --- MANAGER ACTIONS ---
              case 'CREATE_TABLES':
                // Logic to call addTable multiple times if data.data.tables is provided
                showToast(`Creating ${data.data.tables || 1} tables on ${data.data.floor || 'Ground Floor'}...`, 'info');
                break;

              case 'ASSIGN_WAITER':
                showToast(`Assigning waiter ${data.data.waiter} to Table ${data.data.table}...`, 'success');
                break;

              case 'GENERATE_REPORT':
                showToast(`Generating ${data.data.type || 'sales'} report...`, 'info');
                window.print(); // Example action
                break;

              case 'UPDATE_PROFILE':
                showToast(`Profile successfully updated for ${data.data.name || 'user'}! 👤`, 'success');
                break;

              case 'CONFIRM_RESERVATION':
                await approveReservation(data.data.reservationId);
                showToast(`Reservation #${data.data.reservationId} confirmed! ✅`, 'success');
                break;

              case 'KITCHEN_STATUS_UPDATE':
                showToast(`Order #${data.data.orderId} status updated to ${data.data.status}! 🍳`, 'info');
                break;

              case 'ADD_TO_CART':
                showToast(`${data.data.qty || 1} ${data.data.product} added to cart! 🛒`, 'success');
                break;

              default:
                console.log('Unhandled AI Intent:', data.intent);
            }
          } catch (actionErr) {
            console.error('❌ AI Action Failed:', actionErr);
            showToast('Failed to perform action. Please try again.', 'error');
          }
        }
      } else {
        setError(data.message || 'AI is currently unavailable');
      }
      setIsTyping(false);
    });

    socketRef.current.on('ai_typing', (status) => {
      setIsTyping(status);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // --- SPEECH RECOGNITION (STT) ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice recognition not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'hi-IN'; // Support Hindi/Hinglish

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);
    
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      // Auto-submit voice command
      setTimeout(() => {
        handleSendMessage({ preventDefault: () => {} }, transcript);
      }, 500);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const handleSendMessage = async (e, voiceMsg = null) => {
    if (e) e.preventDefault();
    const finalMsg = voiceMsg || message;
    if (!finalMsg.trim()) return;

    const userMsg = finalMsg.trim();
    setMessage('');
    setError(null);
    
    // Add user message to UI
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    
    // Send via Socket.io with Dashboard Context
    setIsTyping(true);
    try {
      const aiContext = getAIContext();
      socketRef.current.emit('ai_message', { 
        message: userMsg,
        dynamicContext: {
          ...aiContext,
          role: user?.role_name || user?.role
        },
        sessionId: socketRef.current?.id || 'default'
      });
    } catch (err) {
      console.error('AI Send Error:', err);
      setIsTyping(false);
    }
  };

  return (
    <div className={`ai-chat-container ${isOpen ? 'open' : ''}`}>
      {/* Chat Toggle Button */}
      <button 
        className="ai-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Chat"
      >
        {isOpen ? (
          <span className="close-icon">✕</span>
        ) : (
          <div className="bot-icon-wrapper">
             <span className="bot-icon">🤖</span>
             <span className="bot-status-online"></span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div className="header-info">
              <span className="header-bot-icon">🤖</span>
              <div>
                <h4>Royal AI Assistant</h4>
                <p>Online | Royal AI OS</p>
              </div>
            </div>
            <button className="header-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="ai-chat-messages">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.role}`}>
                <div className="message-text">{msg.text}</div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message-bubble assistant typing">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="chat-error-notice">
                ⚠️ {error}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-chat-input" onSubmit={handleSendMessage}>
            <button 
              type="button" 
              className={`voice-btn ${isListening ? 'listening' : ''}`}
              onClick={startListening}
              disabled={isTyping}
            >
              {isListening ? '🛑' : '🎤'}
            </button>
            <input 
              type="text" 
              placeholder="Type or click mic to speak..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" disabled={!message.trim() || isTyping}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChat;
