import { supabase } from './supabaseClient.js';
import { generateId, getRandomElement, getRandomInt, paymentMethods } from './utils.js';

export async function seedBillPayments(bills) {
  console.log('Seeding Bill Payments...');
  
  const payments = [];
  let paymentCounter = 1;
  
  for (const bill of bills) {
    if (bill.paymentStatus === 'Pending') continue;
    
    let receivedAmount = bill.grandTotal;
    if (bill.paymentStatus === 'Partial') {
      receivedAmount = getRandomInt(100, bill.grandTotal - 100);
    }
    
    payments.push({
      paymentId: generateId('BPY', paymentCounter++),
      clientId: bill.clientId,
      billId: bill.billId,
      userId: bill.userId,
      receivedAmount,
      paymentMethod: getRandomElement(paymentMethods),
      transactionReference: `TXN${getRandomInt(10000000, 99999999)}`,
      paymentStatus: 'Success',
      paymentDate: new Date().toISOString().split('T')[0],
      remarks: bill.paymentStatus === 'Partial' ? 'Remaining amount next week' : '',
    });
  }

  const allData = [];
  for (let i = 0; i < payments.length; i += 100) {
    const batch = payments.slice(i, i + 100);
    const { data, error } = await supabase.from('billPayments').upsert(batch).select();
    if (error) {
      console.error('Error seeding bill payments batch:', error);
      throw error;
    }
    allData.push(...data);
  }
  
  console.log(`Successfully seeded ${allData.length} bill payments.`);
  return allData;
}
