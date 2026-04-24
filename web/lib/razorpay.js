export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout({ keyId, order, user, onSuccess, onDismiss }) {
  const loaded = await loadRazorpayScript();

  if (!loaded) {
    throw new Error('Razorpay could not load. Please try again.');
  }

  const razorpay = new window.Razorpay({
    key: keyId,
    amount: order.amount,
    currency: order.currency,
    order_id: order.razorpayOrderId,
    name: 'GoVigi Produce',
    description: 'Fresh produce order',
    prefill: {
      name: user?.name || '',
      email: user?.email || '',
    },
    theme: {
      color: '#2E7D32',
    },
    handler: async (response) => {
      await onSuccess({
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });
    },
    modal: {
      ondismiss: onDismiss,
    },
  });

  razorpay.open();
}
