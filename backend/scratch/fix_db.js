const pool = require('../src/database/connection');

async function fixDatabase() {
  console.log('🚀 Starting database fix...');
  try {
    // 1. Add table_id and room_id to reservations
    console.log('📝 Updating reservations table...');
    
    // Check if columns exist first to avoid errors
    const [columns] = await pool.execute('SHOW COLUMNS FROM reservations');
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('table_id')) {
      await pool.execute('ALTER TABLE reservations ADD COLUMN table_id INT NULL AFTER guest_id');
      await pool.execute('ALTER TABLE reservations ADD CONSTRAINT fk_res_table FOREIGN KEY (table_id) REFERENCES restaurant_tables(id)');
      console.log('✅ Added table_id to reservations');
    }

    if (!columnNames.includes('room_id')) {
      await pool.execute('ALTER TABLE reservations ADD COLUMN room_id INT NULL AFTER table_id');
      await pool.execute('ALTER TABLE reservations ADD CONSTRAINT fk_res_room FOREIGN KEY (room_id) REFERENCES rooms(id)');
      console.log('✅ Added room_id to reservations');
    }

    // 2. Ensure menu_items has category_id and it's not null if needed
    // (Already in schema, but good to check)
    
    console.log('✨ Database fix completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error fixing database:', err.message);
    process.exit(1);
  }
}

fixDatabase();
