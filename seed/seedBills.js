import { supabase } from './supabaseClient.js';
import { generateId, getRandomInt } from './utils.js';

export async function seedBills(users, orders) {
  console.log('Seeding Monthly Bills...');
  
  const bills = [];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    
    // Find all orders for this user in July 2026 (or just all their orders for the dummy data)
    const userOrders = orders.filter(o => o.userId === user.userId);
    
    let totalBreakfast = 0;
    let totalLunch = 0;
    let totalDinner = 0;
    let subtotal = 0;
    
    for (const order of userOrders) {
      subtotal += order.totalPrice;
      if (order.mealType === 'Breakfast') totalBreakfast += order.quantity;
      if (order.mealType === 'Lunch') totalLunch += order.quantity;
      if (order.mealType === 'Dinner') totalDinner += order.quantity;
    }
    
    const totalMeals = totalBreakfast + totalLunch + totalDinner;
    
    // Skip creating a bill if they had no orders
    if (totalMeals === 0) continue;
    
    // Randomize payment status
    const statusRand = Math.random();
    let paymentStatus = 'Pending';
    if (statusRand > 0.5) paymentStatus = 'Paid';
    else if (statusRand > 0.2) paymentStatus = 'Partial';

    bills.push({
      billId: generateId('BIL', i + 1),
      clientId: user.clientId,
      userId: user.userId,
      billMonth: '2026-07',
      totalBreakfast,
      totalLunch,
      totalDinner,
      totalMeals,
      subtotal,
      discount: 0,
      extraCharges: 0,
      grandTotal: subtotal,
      paymentStatus,
    });
  }

  const allData = [];
  for (let i = 0; i < bills.length; i += 100) {
    const batch = bills.slice(i, i + 100);
    const { data, error } = await supabase.from('monthlyBills').upsert(batch).select();
    if (error) {
      console.error('Error seeding bills batch:', error);
      throw error;
    }
    allData.push(...data);
  }
  
  console.log(`Successfully seeded ${allData.length} monthly bills.`);
  return allData;
}
