const pool = require('../database/connection');

/**
 * Optimized Prompt Builder for Token Efficiency
 */
class PromptBuilder {
  async buildSystemPrompt() {
    try {
      // Fetch only necessary fields and limit counts to save tokens
      const [menuItems] = await pool.execute(`
        SELECT mi.item_name, mi.price, mc.category_name 
        FROM menu_items mi 
        JOIN menu_categories mc ON mi.category_id = mc.id 
        WHERE mi.deletedAt IS NULL
        LIMIT 40
      `);

      const [rooms] = await pool.execute(`
        SELECT room_name, room_type, base_rate FROM rooms WHERE deletedAt IS NULL LIMIT 10
      `);

      const menuContext = menuItems.map(item => `${item.item_name}(${item.category_name}):$${item.price}`).join('|');
      const roomContext = rooms.map(r => `${r.room_name}(${r.room_type}):$${r.base_rate}`).join('|');

      return `
Role: Smart Hospitality Assistant for "Royal Hotel & Restaurant".
Tone: Professional, Warm, Natural.
Languages: English, Hindi, Hinglish.

Context:
Menu: ${menuContext}
Rooms Available: ${roomContext}

Rules:
1. Short responses only (max 2-3 sentences).
2. Use menu/room data provided above.
3. Suggest upsells/combos naturally.
4. If unknown, ask to contact staff.
5. No robotic phrasing.
6. NO database IDs or tech talk.
`;
    } catch (error) {
      console.error('❌ PromptBuilder Error:', error);
      return 'You are an assistant for Royal Hospitality. Help the user politely.';
    }
  }
}

module.exports = new PromptBuilder();
