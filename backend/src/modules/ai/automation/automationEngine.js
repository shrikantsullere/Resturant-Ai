const { Queue, Worker, QueueScheduler } = require('bullmq');
const Redis = require('ioredis');
const inventoryService = require('../../inventory/inventory.service');
const hospitalityService = require('../../hospitality/hospitality.service');
const notificationService = require('../../notifications/notifications.service');
const { getIO } = require('../../../sockets/socket.manager');

/**
 * Proactive Automation Engine: Background processing for hospitality triggers.
 * Powered by BullMQ + Redis for enterprise-level job scheduling.
 */
class AutomationEngine {
  constructor() {
    this.connection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
    this.automationQueue = new Queue('hospitality_automation', { connection: this.connection });
    
    // Initialize Workers and Schedulers
    this.initWorkers();
    this.scheduleRecurringJobs();
    
    console.log('⚡ [Automation Engine] Proactive systems initialized.');
  }

  /**
   * 🛠️ WORKER REGISTRY: Processes background tasks
   */
  initWorkers() {
    const worker = new Worker('hospitality_automation', async (job) => {
      console.log(`📡 [Automation Worker] Processing job: ${job.name}`);
      
      switch (job.name) {
        case 'CHECK_LOW_STOCK':
          return await this.handleLowStockAlert();
        
        case 'RESERVATION_REMINDER':
          return await this.handleReservationReminders(job.data);
        
        case 'DAILY_REPORT':
          return await this.handleDailyReportGeneration();
        
        default:
          console.warn(`Unknown automation job: ${job.name}`);
      }
    }, { connection: this.connection });

    worker.on('failed', (job, err) => console.error(`❌ Automation job ${job.id} failed:`, err));
  }

  /**
   * ⏰ SCHEDULER: Adds recurring tasks to the queue
   */
  async scheduleRecurringJobs() {
    // 1. Check stock every hour
    await this.automationQueue.add('CHECK_LOW_STOCK', {}, {
      repeat: { cron: '0 * * * *' } 
    });

    // 2. Generate daily report at 11 PM
    await this.automationQueue.add('DAILY_REPORT', {}, {
      repeat: { cron: '0 23 * * *' }
    });
  }

  /**
   * 📦 AUTO LOW STOCK ALERTS
   */
  async handleLowStockAlert() {
    const lowStockItems = await inventoryService.getLowStockItems(5); // threshold 5
    if (lowStockItems.length > 0) {
      const io = getIO();
      const message = `Low Stock Alert: ${lowStockItems.map(i => i.item_name).join(', ')}`;
      
      io.to('admin').emit('automation_alert', { type: 'INVENTORY', message });
      await notificationService.createNotification({
        notification_type: 'LOW_STOCK',
        message,
        targetRole: 'MANAGER'
      });
    }
  }

  /**
   * 📅 AUTO RESERVATION REMINDERS
   */
  async handleReservationReminders(data) {
    // Logic to send WhatsApp/SMS via third party API
    await notificationService.createNotification({
      notification_type: 'REMINDER',
      message: `Hi ${data.guestName}, your table is ready in 30 minutes!`,
      targetRole: 'CUSTOMER'
    });
  }

  /**
   * 📊 AUTO REPORT GENERATION
   */
  async handleDailyReportGeneration() {
    // Logic to compile daily sales and generate PDF/Link
    const io = getIO();
    io.to('admin').emit('automation_report', { 
      message: 'Daily EOD Report is ready for review.',
      link: '/admin/reports/daily' 
    });
  }

  /**
   * 🍳 AUTO KITCHEN OVERLOAD MONITOR
   */
  async monitorKitchenLoad(activeOrders) {
    if (activeOrders > 15) {
       const io = getIO();
       io.to('manager').emit('automation_alert', { 
         type: 'KITCHEN_OVERLOAD', 
         message: 'Kitchen queue is high (15+ orders). Consider delaying new orders.' 
       });
    }
  }
}

module.exports = new AutomationEngine();
