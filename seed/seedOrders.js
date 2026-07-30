import { supabase } from './supabaseClient.js';
import { generateId, getRandomElement, getRandomInt, getRandomDate, mealTypes, orderStatuses } from './utils.js';

export async function seedOrders(users, menuItems) {
  console.log('Seeding Orders...');
  
  const orders = [];
  let orderCounter = 1;
  
  // Past 14 days, today, next 7 days
  const today = new Date();
  const past = new Date(today);
  past.setDate(today.getDate() - 14);
  const future = new Date(today);
  future.setDate(today.getDate() + 7);
  
  // Create ~500 orders
  for (let i = 0; i < 500; i++) {
    const user = getRandomElement(users);
    
    // Find menu items belonging to the same client
    const clientMenuItems = menuItems.filter(m => m.clientId === user.clientId);
    if (clientMenuItems.length === 0) continue; // Skip if this client has no menu items
    
    const menuItem = getRandomElement(clientMenuItems);
    const quantity = getRandomInt(1, 3);
    const orderDate = getRandomDate(past, future);
    
    // Status logic based on date
    let status = 'Delivered';
    if (orderDate > today) status = 'Received';
    if (orderDate.toDateString() === today.toDateString()) status = getRandomElement(orderStatuses);

    orders.push({
      orderId: generateId('ORD', orderCounter++),
      clientId: user.clientId,
      branchId: user.branchId,
      userId: user.userId,
      menuItemId: menuItem.menuItemId,
      orderDate: orderDate.toISOString().split('T')[0], // YYYY-MM-DD
      mealType: menuItem.mealType,
      quantity: quantity,
      unitPrice: menuItem.price,
      totalPrice: quantity * menuItem.price,
      deliveryStatus: status,
      orderStatus: status,
    });
  }

  // Insert in batches of 100
  const allData = [];
  for (let i = 0; i < orders.length; i += 100) {
    const batch = orders.slice(i, i + 100);
    const { data, error } = await supabase.from('orders').upsert(batch).select();
    if (error) {
      console.error('Error seeding orders batch:', error);
      throw error;
    }
    allData.push(...data);
  }
  
  console.log(`Successfully seeded ${allData.length} orders.`);
  return allData;
}
