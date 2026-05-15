const pool = require('./src/database/connection');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Starting Comprehensive Seeding...');
  
  try {
    // 1. Seed Roles
    const [existingRoles] = await pool.execute('SELECT id FROM roles');
    if (existingRoles.length === 0) {
      await pool.execute(`INSERT INTO roles (id, role_name, description) VALUES 
        (1, 'admin', 'Full System Access'),
        (2, 'manager', 'Operational Control'),
        (3, 'waiter', 'Order Handling'),
        (4, 'chef', 'Kitchen Operations'),
        (5, 'cashier', 'Billing & Payments'),
        (6, 'customer', 'QR Ordering & Guest Access')`);
    }

    // 2. Seed Users with role-specific passwords (e.g., admin123, manager123)
    console.log('Seeding Users...');
    const usersToSeed = [
      { name: 'Royal Admin', email: 'admin@gilahouse.com', pass: 'admin123', roleId: 1 },
      { name: 'Operational Manager', email: 'manager@gilahouse.com', pass: 'manager123', roleId: 2 },
      { name: 'Staff Waiter', email: 'waiter@gilahouse.com', pass: 'waiter123', roleId: 3 },
      { name: 'Executive Chef', email: 'chef@gilahouse.com', pass: 'chef123', roleId: 4 }
    ];

    for (const u of usersToSeed) {
      const [exists] = await pool.execute('SELECT id FROM users WHERE email = ?', [u.email]);
      if (exists.length === 0) {
        const hash = await bcrypt.hash(u.pass, 10);
        await pool.execute(`INSERT INTO users (full_name, email, password, role_id, status) VALUES (?, ?, ?, ?, 'active')`, 
          [u.name, u.email, hash, u.roleId]);
      }
    }

    console.log('✅ Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
}

seed();
