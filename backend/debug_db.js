const pool = require('./src/database/connection');

async function debugDB() {
  try {
    const [items] = await pool.execute('SELECT * FROM menu_items');
    console.log('Menu Items Count:', items.length);
    if (items.length > 0) console.log('Sample Item:', items[0]);

    const [rooms] = await pool.execute('SELECT * FROM rooms');
    console.log('Rooms Count:', rooms.length);
    if (rooms.length > 0) console.log('Sample Room:', rooms[0]);

    const [users] = await pool.execute('SELECT * FROM users');
    console.log('Users Count:', users.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugDB();
