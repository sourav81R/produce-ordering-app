import Razorpay from 'razorpay';

let razorpayInstance = null;

export const hasRazorpayConfig = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

export const getRazorpayInstance = () => {
  if (!hasRazorpayConfig()) {
    const error = new Error('Razorpay is not configured on the server.');
    error.status = 500;
    throw error;
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayInstance;
};
