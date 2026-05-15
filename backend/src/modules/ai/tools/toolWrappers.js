const ordersService = require('../../orders/orders.service');
const reservationsService = require('../../reservations/reservations.service');
const roomsService = require('../../rooms/rooms.service');
const inventoryService = require('../../inventory/inventory.service');
const billingService = require('../../billing/billing.service');
const pool = require('../../../database/connection');

/**
 * AI Tool Wrappers: Bridges the gap between fuzzy AI input and strict backend services.
 * These wrappers ensure we don't duplicate business logic but return AI-friendly data.
 */
const ToolWrappers = {
  /**
   * Wrapper for order creation with intelligent item mapping
   */
  createOrder: async (params, user) => {
    // 1. Fetch menu items to map AI names to IDs
    const [menuItems] = await pool.execute('SELECT id, item_name, price FROM menu_items WHERE deletedAt IS NULL');
    
    const mappedItems = params.items.map(aiItem => {
      const found = menuItems.find(mi => mi.item_name.toLowerCase().includes(aiItem.name.toLowerCase()));
      if (!found) throw new Error(`Item "${aiItem.name}" is not available in our menu.`);
      
      return {
        menu_item_id: found.id,
        quantity: aiItem.qty || 1,
        unit_price: found.price,
        total_price: found.price * (aiItem.qty || 1)
      };
    });

    const orderData = {
      order_number: `ORD-AI-${Date.now()}`,
      table_id: params.tableId || 0,
      user_id: user?.id,
      order_status: 'Pending',
      total_amount: mappedItems.reduce((sum, item) => sum + item.total_price, 0)
    };

    const orderId = await ordersService.createOrder(orderData, mappedItems);
    return { 
      success: true, 
      orderId, 
      orderNumber: orderData.order_number,
      itemsCount: mappedItems.length 
    };
  },

  /**
   * Wrapper for reservation logic
   */
  createReservation: async (params, user) => {
    const result = await reservationsService.createReservation({
      ...params,
      type: params.roomNumber ? 'room' : 'table',
      guestId: user?.id
    });
    return { success: true, reservationId: result.reservationId, type: params.roomNumber ? 'Room' : 'Table' };
  },

  /**
   * Wrapper for Inventory Checks
   */
  checkInventory: async (params) => {
    const stockData = await inventoryService.getItemStock(params.itemName);
    return {
      success: true,
      itemName: params.itemName,
      availableQty: stockData?.quantity || 0,
      status: (stockData?.quantity > 0) ? 'Available' : 'Out of Stock'
    };
  },

  /**
   * Wrapper for Sales Reports (Admin Only)
   */
  getSalesReport: async (params) => {
    const stats = await ordersService.getAnalytics(params.period || 'today');
    return {
      success: true,
      period: params.period,
      totalRevenue: stats.revenue,
      totalOrders: stats.orderCount,
      topItems: stats.topItems
    };
  },

  /**
   * Wrapper for profile updates
   */
  updateUserProfile: async (params, user) => {
    if (!user?.id) throw new Error('User authentication required for profile update');
    
    const authService = require('../../auth/auth.service');
    const result = await authService.updateProfile(user.id, params);

    if (result.affectedRows === 0) {
      return { success: false, message: "No profile changes were applied. (Same data or record not found)" };
    }

    const { getIO } = require('../../../sockets/socket.manager');
    getIO().emit('profile_updated', { userId: user.id, updates: params });
    
    return {
      success: true,
      message: `Done! Profile updated with ${Object.keys(params).join(', ')}.`,
      updatedFields: Object.keys(params)
    };
  },

  /**
   * Resolve menu item name to ID from DB
   */
  _resolveMenuItemId: async (itemName) => {
    const [rows] = await pool.execute(
      `SELECT id, item_name FROM menu_items WHERE item_name LIKE ? AND deletedAt IS NULL LIMIT 1`,
      [`%${itemName}%`]
    );
    if (!rows.length) throw new Error(`Menu item "${itemName}" not found. Please check the name.`);
    return rows[0];
  },

  /**
   * Add item to favorites using existing favorites table
   */
  addToFavorites: async (params, user) => {
    if (!user?.id) throw new Error('Authentication required.');
    const item = await ToolWrappers._resolveMenuItemId(params.itemName);

    const [existing] = await pool.execute(
      'SELECT id FROM favorites WHERE customer_id = ? AND menu_item_id = ?',
      [user.id, item.id]
    );
    if (existing.length > 0) {
      return { success: false, message: `"${item.item_name}" is already in your favorites.` };
    }

    await pool.execute(
      'INSERT INTO favorites (customer_id, menu_item_id) VALUES (?, ?)',
      [user.id, item.id]
    );

    const { getIO } = require('../../../sockets/socket.manager');
    getIO().emit('favorites_updated', { userId: user.id, action: 'added', item: item.item_name });

    return { success: true, message: `"${item.item_name}" has been added to your favorites.` };
  },

  /**
   * Remove item from favorites using existing favorites table
   */
  removeFromFavorites: async (params, user) => {
    if (!user?.id) throw new Error('Authentication required.');
    const item = await ToolWrappers._resolveMenuItemId(params.itemName);

    const [result] = await pool.execute(
      'DELETE FROM favorites WHERE customer_id = ? AND menu_item_id = ?',
      [user.id, item.id]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: `"${item.item_name}" was not found in your favorites.` };
    }

    const { getIO } = require('../../../sockets/socket.manager');
    getIO().emit('favorites_updated', { userId: user.id, action: 'removed', item: item.item_name });

    return { success: true, message: `"${item.item_name}" has been removed from your favorites.` };
  }
};

module.exports = ToolWrappers;
