import { supabase } from './supabaseClient.js';
import { generateId, getRandomElement, indianFirstNames, indianLastNames, getRandomInt, getRandomDate } from './utils.js';

export async function seedUsers(groups) {
  console.log('Seeding Users...');
  
  const users = [];
  const start = new Date(2025, 0, 1);
  const end = new Date();
  
  for (let i = 1; i <= 300; i++) {
    const group = getRandomElement(groups);
    const firstName = getRandomElement(indianFirstNames);
    const lastName = getRandomElement(indianLastNames);
    
    users.push({
      userId: generateId('USR', i),
      clientId: group.clientId,
      branchId: group.branchId,
      whatsAppGroupId: group.whatsAppGroupId,
      name: `${firstName} ${lastName}`,
      mobile: `99${String(getRandomInt(10000000, 99999999))}`,
      gender: getRandomElement(['Male', 'Female']),
      roomNumber: `${getRandomElement(['A', 'B', 'C', 'D'])}-${getRandomInt(101, 505)}`,
      joinedDate: getRandomDate(start, end).toISOString(),
      leftDate: null,
      status: 'Active',
    });
  }

  // Insert in batches of 100 to avoid large payload errors
  const allData = [];
  for (let i = 0; i < users.length; i += 100) {
    const batch = users.slice(i, i + 100);
    const { data, error } = await supabase.from('users').upsert(batch).select();
    if (error) {
      console.error('Error seeding users batch:', error);
      throw error;
    }
    allData.push(...data);
  }
  
  console.log(`Successfully seeded ${allData.length} users.`);
  return allData;
}
