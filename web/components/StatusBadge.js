const statusClassMap = {
  Pending: 'status-badge pending',
  Preparing: 'status-badge confirmed',
  'Out for delivery': 'status-badge in-transit',
  Delivered: 'status-badge delivered',
  Cancelled: 'status-badge cancelled',
};

export default function StatusBadge({ status }) {
  return <span className={statusClassMap[status] || 'status-badge'}>{status}</span>;
}
