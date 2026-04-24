export default function PaymentModal({ open, title = 'Processing payment', message = 'Please wait...' }) {
  if (!open) {
    return null;
  }

  return (
    <div className="payment-modal-shell" role="status" aria-live="polite">
      <div className="payment-modal-card">
        <div className="payment-modal-spinner" aria-hidden="true" />
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </div>
  );
}
