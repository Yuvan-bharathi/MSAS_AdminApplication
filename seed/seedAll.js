import { seedClients } from './seedClients.js';
import { seedBranches } from './seedBranches.js';
import { seedGroups } from './seedGroups.js';
import { seedMenuItems } from './seedMenuItems.js';
import { seedUsers } from './seedUsers.js';
import { seedOrders } from './seedOrders.js';
import { seedPayments } from './seedPayments.js';
import { seedBills } from './seedBills.js';
import { seedBillPayments } from './seedBillPayments.js';

async function runSeed() {
  console.log('--- STARTING DATABASE SEEDING ---');
  try {
    const clients = await seedClients();
    const branches = await seedBranches(clients);
    const groups = await seedGroups(branches);
    const menuItems = await seedMenuItems(clients);
    const users = await seedUsers(groups);
    const orders = await seedOrders(users, menuItems);
    const payments = await seedPayments(users); // Kept as requested
    
    // New Architectural Tables
    const bills = await seedBills(users, orders);
    const billPayments = await seedBillPayments(bills);
    
    console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
    console.log(`Summary:`);
    console.log(`Clients: ${clients.length}`);
    console.log(`Branches: ${branches.length}`);
    console.log(`WhatsApp Groups: ${groups.length}`);
    console.log(`Menu Items: ${menuItems.length}`);
    console.log(`Users: ${users.length}`);
    console.log(`Orders: ${orders.length}`);
    console.log(`Legacy Payments: ${payments.length}`);
    console.log(`Monthly Bills: ${bills.length}`);
    console.log(`Bill Payments: ${billPayments.length}`);
    
  } catch (err) {
    console.error('--- SEEDING FAILED ---', err);
  }
}

runSeed();
