import PaymentHistoryTable from '../../components/tables/PaymentHistoryTable';

const CLIENT_ID = 'CLT0001';

export default function Payments() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-text-primary">Payments</h2>
        <p className="text-text-secondary mt-1">Track and manage monthly bill payments.</p>
      </div>
      <PaymentHistoryTable clientId={CLIENT_ID} />
    </div>
  );
}
