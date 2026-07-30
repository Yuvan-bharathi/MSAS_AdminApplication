import RecentOrdersTable from '../../components/tables/RecentOrdersTable';

const CLIENT_ID = 'CLT0001';

export default function Orders() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-text-primary">Orders</h2>
        <p className="text-text-secondary mt-1">Manage your meal subscription orders.</p>
      </div>
      <RecentOrdersTable 
        clientId={CLIENT_ID} 
        limit={null} 
        title="All Orders" 
        showViewAll={false} 
      />
    </div>
  );
}
