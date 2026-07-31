import { supabase } from './supabaseClient.js';
import { generateId, getRandomElement, getRandomInt } from './utils.js';

export async function seedBranches(clients) {
  console.log('Seeding Branches...');
  
  const branchCountPerClient = {};
  const branches = [];
  
  for (let i = 1; i <= 25; i++) {
    const client = getRandomElement(clients);
    
    if (!branchCountPerClient[client.clientId]) {
      branchCountPerClient[client.clientId] = 0;
    }
    const branchIndex = branchCountPerClient[client.clientId];
    const letter = String.fromCharCode(65 + branchIndex); // 65 is 'A'
    branchCountPerClient[client.clientId]++;
    
    branches.push({
      branchId: generateId('BRN', i),
      clientId: client.clientId,
      branchName: `${client.businessName} - Branch ${letter}`,
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
