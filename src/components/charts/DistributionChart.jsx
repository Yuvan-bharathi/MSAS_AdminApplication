import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'Standard Meals', value: 400 },
  { name: 'Vegan/Vegetarian', value: 300 },
  { name: 'Keto Diet', value: 300 },
  { name: 'Custom Plans', value: 200 },
];

const COLORS = ['#16a34a', '#0ea5e9', '#f59e0b', '#0d9488'];

export default function DistributionChart() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-white shadow-sm rounded-2xl p-6 h-full flex flex-col border border-border-subtle"
    >
      <div className="mb-2">
        <h3 className="text-lg font-medium text-text-primary">Meal Distribution</h3>
        <p className="text-sm text-text-secondary">Overview of current active plans</p>
      </div>
      
      <div className="flex-1 w-full min-h-75 flex items-center justify-center mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', color: '#1f2937', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
              itemStyle={{ color: '#1f2937' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={50} 
              iconType="circle" 
              wrapperStyle={{ fontSize: '12px', color: '#6b7280', paddingTop: '20px' }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
