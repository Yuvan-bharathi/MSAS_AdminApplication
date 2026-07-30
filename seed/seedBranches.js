import { supabase } from './supabaseClient.js';
import { generateId, getRandomElement, getRandomInt } from './utils.js';

export async function seedBranches(clients) {
  console.log('Seeding Branches...');
  
  const branches = [];
  
  for (let i = 1; i <= 25; i++) {
    const client = getRandomElement(clients);
    
    branches.push({
      branchId: generateId('BRN', i),
      clientId: client.clientId,
      branchName: `${client.businessName} - Branch ${getRandomInt(1, 3)}`,
      branchType: client.businessType,
      address: `${getRandomInt(1, 100)} Cross, Layout ${getRandomInt(1, 10)}`,
      city: client.city,
      state: client.state,
      isActive: true,
    });
  }

  const { data, error } = await supabase.from('branches').upsert(branches).select();
  
  if (error) {
    console.error('Error seeding branches:', error);
    throw error;
  }
  
  console.log(`Successfully seeded ${data.length} branches.`);
  return data;
}
