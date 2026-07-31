import { supabase } from './supabaseClient.js';

async function resetAndSeed() {
  console.log('Cleaning up database...');
  // Delete in reverse dependency order
  await supabase.from('billPayments').delete().neq('id', '0');
  await supabase.from('monthlyBills').delete().neq('billId', '0');
  await supabase.from('orders').delete().neq('orderId', '0');
  await supabase.from('payments').delete().neq('paymentId', '0');
  await supabase.from('users').delete().neq('userId', '0');
  await supabase.from('menuItems').delete().neq('menuItemId', '0');
  await supabase.from('whatsAppGroups').delete().neq('whatsAppGroupId', '0');
  await supabase.from('branches').delete().neq('branchId', '0');
  await supabase.from('clientsDetails').delete().neq('clientId', '0');
  console.log('Database cleaned.');
}

resetAndSeed();
