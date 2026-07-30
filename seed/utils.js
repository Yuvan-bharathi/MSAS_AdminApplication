/**
 * Utility functions for seeding the MSAS Database
 */

/**
 * Generates a padded ID string with a prefix.
 * Example: generateId('CLT', 1) -> 'CLT0001'
 */
export function generateId(prefix, index, padLength = 4) {
  return `${prefix}${String(index).padStart(padLength, '0')}`;
}

/**
 * Returns a random element from an array
 */
export function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Returns a random number between min and max (inclusive)
 */
export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a random date between two dates
 */
export function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Dummy Data Pools
export const indianFirstNames = [
  'Rahul', 'Arun', 'Priya', 'Sanjay', 'Amit', 'Neha', 'Pooja', 'Ravi', 'Anil',
  'Deepa', 'Karthik', 'Swati', 'Vikram', 'Divya', 'Suresh', 'Sneha', 'Ajay', 'Meera',
  'Vijay', 'Kavita', 'Manoj', 'Roshni', 'Sunil', 'Preeti', 'Rajesh', 'Anjali',
  'Sachin', 'Nisha', 'Rakesh', 'Aarti', 'Sandeep', 'Shweta', 'Ashok', 'Kiran',
  'Ramesh', 'Jyoti', 'Dinesh', 'Poonam', 'Mukesh', 'Rekha'
];

export const indianLastNames = [
  'Sharma', 'Singh', 'Patel', 'Kumar', 'Gupta', 'Reddy', 'Rao', 'Nair', 'Das',
  'Verma', 'Chauhan', 'Yadav', 'Joshi', 'Mishra', 'Iyer', 'Menon', 'Bose', 'Garg',
  'Agarwal', 'Chatterjee', 'Deshmukh', 'Kulkarni', 'Mehta', 'Nambiar', 'Pillai'
];

export const businessTypes = ['Hostel', 'PG', 'Home Food Service', 'Apartment', 'Corporate Canteen', 'Mess'];
export const plans = ['Basic', 'Premium', 'Enterprise'];
export const subscriptionStatuses = ['Active', 'Expired', 'Cancelled'];
export const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'];
export const states = ['Karnataka', 'Maharashtra', 'Delhi', 'Telangana', 'Tamil Nadu', 'Maharashtra'];

export const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
export const foodItems = [
  'Idli Sambar', 'Masala Dosa', 'Poha', 'Aloo Paratha', 'Upma',
  'Paneer Butter Masala', 'Dal Makhani', 'Chicken Biryani', 'Veg Pulao', 'Roti Sabzi',
  'Chole Bhature', 'Rajma Chawal', 'Fish Curry', 'Egg Curry', 'Mutton Rogan Josh',
  'Samosa', 'Pakora', 'Pav Bhaji', 'Vada Pav', 'Kathi Roll',
  'Gulab Jamun', 'Rasgulla', 'Kheer', 'Gajar Ka Halwa', 'Jalebi'
];

export const orderStatuses = ['Received', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
export const paymentMethods = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash'];
export const paymentStatuses = ['Paid', 'Partial', 'Pending', 'Failed'];
