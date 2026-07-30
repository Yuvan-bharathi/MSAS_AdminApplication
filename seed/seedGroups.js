import { supabase } from './supabaseClient.js';
import { generateId, getRandomElement, getRandomInt } from './utils.js';

export async function seedGroups(branches) {
  console.log('Seeding WhatsApp Groups...');
  
  const groups = [];
  
  for (let i = 1; i <= 40; i++) {
    const branch = getRandomElement(branches);
    
    groups.push({
      whatsAppGroupId: generateId('GRP', i),
      clientId: branch.clientId,
      branchId: branch.branchId,
      groupName: `${branch.branchName.substring(0, 15)} Updates`,
      groupDescription: 'Official WhatsApp group for daily menus and updates.',
      groupType: getRandomElement(['Broadcast', 'Interactive']),
      isActive: true,
    });
  }

  const { data, error } = await supabase.from('whatsAppGroups').upsert(groups).select();
  
  if (error) {
    console.error('Error seeding whatsapp groups:', error);
    throw error;
  }
  
  console.log(`Successfully seeded ${data.length} whatsapp groups.`);
  return data;
}
