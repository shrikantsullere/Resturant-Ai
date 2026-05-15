/**
 * Enterprise AI Tool Registry: Definitive blueprint for all autonomous hospitality actions.
 * These definitions follow the OpenAI function-calling schema for future-proofing.
 */
const toolRegistry = {
  // --- 🛎️ HOSPITALITY / RESERVATIONS ---
  create_reservation: {
    name: 'create_reservation',
    description: 'Book a table for a guest.',
    parameters: {
      type: 'object',
      properties: {
        tableId: { type: 'number' },
        guestName: { type: 'string' },
        time: { type: 'string', description: 'ISO format or natural language time' },
        guests: { type: 'number' }
      }
    }
  },
  confirm_reservation: {
    name: 'confirm_reservation',
    description: 'Approve a pending reservation.',
    parameters: {
      type: 'object',
      properties: {
        reservationId: { type: 'number' }
      }
    }
  },

  // --- 🍕 RESTAURANT / ORDERS ---
  create_order: {
    name: 'create_order',
    description: 'Place a new food/drink order.',
    parameters: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              qty: { type: 'number' }
            }
          }
        },
        tableId: { type: 'number' }
      }
    }
  },
  track_order: {
    name: 'track_order',
    description: 'Check the status of an existing order.',
    parameters: {
      type: 'object',
      properties: {
        orderId: { type: 'number' }
      }
    }
  },

  // --- 🏨 HOTEL / ROOMS ---
  create_room_booking: {
    name: 'create_room_booking',
    description: 'Reserve a hotel room for a guest.',
    parameters: {
      type: 'object',
      properties: {
        roomNumber: { type: 'string' },
        checkIn: { type: 'string' },
        checkOut: { type: 'string' },
        guestName: { type: 'string' }
      }
    }
  },

  // --- 📦 INVENTORY ---
  check_inventory: {
    name: 'check_inventory',
    description: 'Check stock levels for ingredients or supplies.',
    parameters: {
      type: 'object',
      properties: {
        itemName: { type: 'string' }
      }
    }
  },
  update_inventory: {
    name: 'update_inventory',
    description: 'Add or remove stock from inventory.',
    parameters: {
      type: 'object',
      properties: {
        itemId: { type: 'number' },
        qty: { type: 'number' },
        action: { type: 'string', enum: ['add', 'remove'] }
      }
    }
  },

  // --- 💰 BILLING & FINANCE ---
  generate_bill: {
    name: 'generate_bill',
    description: 'Generate the final bill for a table or room.',
    parameters: {
      type: 'object',
      properties: {
        orderId: { type: 'number' },
        tableId: { type: 'number' }
      }
    }
  },

  // --- 📊 REPORTS ---
  get_sales_report: {
    name: 'get_sales_report',
    description: 'Fetch revenue analytics for a specific period.',
    parameters: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['today', 'week', 'month'] }
      }
    }
  },

  // --- 🛎️ STAFF & TASKS ---
  create_task: {
    name: 'create_task',
    description: 'Assign a task to staff (Housekeeping, Laundry, etc).',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] }
      }
    }
  },

  // --- CUSTOMER / PROFILE ---
  update_user_profile: {
    name: 'update_user_profile',
    description: 'Update the user full name or mobile number in their profile. Understands Hinglish like "naam change krdo" or "number update kardo".',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'New full name of the user (extracted from "naam", "full name")' },
        mobile: { type: 'string', description: 'New mobile number (extracted from "number", "phone", "mobile")' }
      }
    }
  }
};

module.exports = toolRegistry;
