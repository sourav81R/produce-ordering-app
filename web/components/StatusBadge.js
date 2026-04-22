const statusClassMap = {
  Pending: 'status-badge pending',
  Confirmed: 'status-badge confirmed',
  Delivered: 'status-badge delivered',
};

export default function StatusBadge({ status }) {
  return <span className={statusClassMap[status] || 'status-badge'}>{status}</span>;
}

