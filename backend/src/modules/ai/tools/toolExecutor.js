const toolWrappers = require('./toolWrappers');
const reservationsService = require('../../reservations/reservations.service');
const roomsService = require('../../rooms/rooms.service');
const tasksService = require('../../tasks/tasks.service');
const { getIO } = require('../../../sockets/socket.manager');

/**
 * Production-Ready Tool Executor: The secure bridge between AI and Business Logic.
 */
class ToolExecutor {
  constructor() {
    this.io = null;
  }

  /**
   * Main execution entry point
   */
  async execute(toolName, parameters, context = {}) {
    const { user } = context;
    console.log(`⚙️ [Tool Executor] Intent: ${toolName}`);

    try {
      this.validatePermissions(toolName, user?.role);

      switch (toolName) {
        case 'create_order':
          return await toolWrappers.createOrder(parameters, user);

        case 'create_reservation':
        case 'create_room_booking':
          return await toolWrappers.createReservation(parameters, user);

        case 'check_inventory':
          return await toolWrappers.checkInventory(parameters);

        case 'get_sales_report':
          return await toolWrappers.getSalesReport(parameters);

        case 'confirm_reservation':
          await reservationsService.updateStatus(parameters.reservationId, 'confirmed');
          return { success: true };

        case 'update_user_profile':
          return await toolWrappers.updateUserProfile(parameters, user);

        case 'add_to_favorites':
          return await toolWrappers.addToFavorites(parameters, user);

        case 'remove_from_favorites':
          return await toolWrappers.removeFromFavorites(parameters, user);

        case 'create_task':
          await tasksService.createTask({ ...parameters, status: 'pending' });
          return { success: true };

        default:
          return { success: false, message: `No executable backend tool connected for "${toolName}".` };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Validates Role-Based Access Control (RBAC) for tools
   */
  validatePermissions(toolName, role) {
    const adminOnlyTools = ['get_sales_report', 'update_inventory', 'confirm_reservation'];
    const customerTools = ['update_user_profile', 'add_to_favorites', 'remove_from_favorites', 'track_order', 'create_order'];
    
    const safeRole = (role || '').toLowerCase();

    if (adminOnlyTools.includes(toolName) && safeRole !== 'admin' && safeRole !== 'manager') {
      throw new Error(`Your role (${role || 'Guest'}) does not have permission for this action.`);
    }
    // Customer tools are always allowed for authenticated users
  }

  /**
   * Specialized Order Handler (to ensure data consistency)
   */
  async handleCreateOrder(params, user) {
    // Map AI names to DB items (This could also be done in AI service)
    // For now, we assume params.items is already structured correctly or handled by OrdersService
    const orderId = await ordersService.createOrder(
      { tableId: params.tableId, userId: user?.id },
      params.items
    );
    return { success: true, orderId };
  }
}

module.exports = new ToolExecutor();
