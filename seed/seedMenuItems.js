import { supabase } from './supabaseClient.js';
import { generateId, getRandomElement, getRandomInt, mealTypes, foodItems } from './utils.js';

export async function seedMenuItems(clients) {
  console.log('Seeding Menu Items...');
  
  const menuItems = [];
  
  for (let i = 1; i <= 25; i++) {
    const client = getRandomElement(clients);
    
    menuItems.push({
      menuItemId: generateId('MEN', i),
      clientId: client.clientId,
      mealType: getRandomElement(mealTypes),
      menuItemName: getRandomElement(foodItems),
      price: getRandomInt(50, 300),
      isAvailable: true,
    });
  }

  const { data, error } = await supabase.from('menuItems').upsert(menuItems).select();
  
  if (error) {
    console.error('Error seeding menu items:', error);
    throw error;
  }
  
  console.log(`Successfully seeded ${data.length} menu items.`);
  return data;
}
