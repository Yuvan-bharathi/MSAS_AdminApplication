import { supabase } from './supabaseClient.js';
import { generateId, getRandomElement, getRandomInt, paymentMethods } from './utils.js';

export async function seedPayments(users) {
  console.log('Seeding Payments...');
  
  const payments = [];
  
  // Create exactly one payment for each user to simplify dummy data
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const totalAmount = getRandomInt(3000, 6000);
    
    // Randomize status
    const statusRand = Math.random();
    let status = 'Pending';
    let paidAmount = 0;
    
    if (statusRand > 0.5) {
      status = 'Paid';
      paidAmount = totalAmount;
    } else if (statusRand > 0.2) {
      status = 'Partial';
      paidAmount = getRandomInt(1000, totalAmount - 500);
    }
    
    payments.push({
      paymentId: generateId('PAY', i + 1),
      clientId: user.clientId,
      userId: user.userId,
      paymentMonth: 'July 2026',
      totalAmount: totalAmount,
      paidAmount: paidAmount,
      balanceAmount: totalAmount - paidAmount,
      paymentMethod: status !== 'Pending' ? getRandomElement(paymentMethods) : null,
      paymentStatus: status,
      remarks: status === 'Partial' ? 'Will pay rest next week' : '',
    });
  }

  // Insert in batches
  const allData = [];
  for (let i = 0; i < payments.length; i += 100) {
    const batch = payments.slice(i, i + 100);
    const { data, error } = await supabase.from('payments').upsert(batch).select();
    if (error) {
      console.error('Error seeding payments batch:', error);
      throw error;
    }
    allData.push(...data);
  }
  
  console.log(`Successfully seeded ${allData.length} payments.`);
  return allData;
}
