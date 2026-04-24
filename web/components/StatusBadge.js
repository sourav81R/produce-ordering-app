const statusClassMap = {
  Pending: 'status-badge pending',
  Confirmed: 'status-badge confirmed',
  Delivered: 'status-badge delivered',
  Cancelled: 'status-badge cancelled',
};

export default function StatusBadge({ status }) {
  return <span className={statusClassMap[status] || 'status-badge'}>{status}</span>;
}
