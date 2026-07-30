import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';

export default function StatCard({ title, value, change, changeType, icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white border border-border-subtle shadow-sm rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300"
    >
      <div className="absolute top-0 right-0 p-6 opacity-40 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-24 h-24 text-brand-50" />
      </div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        <div className="p-2 bg-brand-50 rounded-xl border border-brand-100">
          <Icon className="w-5 h-5 text-brand-600" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-4 relative z-10">
        <h2 className="text-3xl font-bold text-text-primary">{value}</h2>
        <div className={clsx(
          "flex items-center text-sm font-medium",
          changeType === 'positive' ? "text-brand-600" : "text-danger"
        )}>
          {changeType === 'positive' ? (
            <ArrowUpRight className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDownRight className="w-4 h-4 mr-1" />
          )}
          {change}
        </div>
      </div>
    </motion.div>
  );
}
