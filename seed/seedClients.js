import { supabase } from './supabaseClient.js';
import { generateId, getRandomElement, indianFirstNames, indianLastNames, businessTypes, plans, subscriptionStatuses, cities, states, getRandomInt } from './utils.js';

export async function seedClients() {
  console.log('Seeding Clients...');
  
  const clients = [];
  
  for (let i = 1; i <= 10; i++) {
    const firstName = getRandomElement(indianFirstNames);
    const lastName = getRandomElement(indianLastNames);
    
    clients.push({
      clientId: generateId('CLT', i),
      // authUserId left null for dummy data unless specifically required
      ownerName: `${firstName} ${lastName}`,
      ownerMobile: `98${String(getRandomInt(10000000, 99999999))}`,
      ownerEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      businessName: `${firstName}'s ${getRandomElement(businessTypes)}`,
      businessType: getRandomElement(businessTypes),
      plan: getRandomElement(plans),
      price: getRandomInt(1000, 5000),
      subscriptionStatus: getRandomElement(subscriptionStatuses),
      subscriptionStartDate: new Date().toISOString(),
      subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      address: `123 Main St, Sector ${getRandomInt(1, 50)}`,
      city: getRandomElement(cities),
      state: getRandomElement(states),
      country: 'India',
      isActive: true,
    });
  }

  const { data, error } = await supabase.from('clientsDetails').upsert(clients).select();
  
  if (error) {
    console.error('Error seeding clients:', error);
    throw error;
  }
  
  console.log(`Successfully seeded ${data.length} clients.`);
  return data;
}
