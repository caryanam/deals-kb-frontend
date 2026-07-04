import { createPaymentOrder, markPaymentFailed, verifyPayment } from '../api/paymentApi';
import { getCurrentUser } from '../api/authApi';
import { toast } from 'react-toastify';

export const loadRazorpay = () =>
  new Promise((resolve) => {
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

export const triggerPayment = async (planId, onSuccess, onCancel) => {
  try {
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error('Unable to load Razorpay Checkout.');
      return null;
    }

    const data = await createPaymentOrder(planId);
    const order = data.order;
    const razorpayKey = data.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!razorpayKey) {
      toast.error('Razorpay key is not configured.');
      return null;
    }

    return new Promise((resolve) => {
      const checkout = new window.Razorpay({
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: 'DealsKB',
        description: planId?.startsWith('buyer_') ? 'Bidding Pass Activation' : 'Plan Activation',
        order_id: order.id,
        prefill: data.prefill || {},
        notes: order.notes || {},
        theme: { color: '#2563eb' },
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            const freshUser = await getCurrentUser();
            sessionStorage.setItem('user', JSON.stringify(freshUser));
            
            toast.success('Payment verified successfully.');
            if (onSuccess) onSuccess(freshUser);
            resolve(freshUser);
          } catch (err) {
            console.error('Payment verification failed:', err);
            await markPaymentFailed(order.id, 'Payment verification failed').catch(() => null);
            toast.error(err.response?.data?.detail || 'Payment verification failed.');
            resolve(null);
          }
        },
        modal: {
          ondismiss: async () => {
            await markPaymentFailed(order.id, 'Payment cancelled by user').catch(() => null);
            toast.info('Payment cancelled.');
            if (onCancel) onCancel();
            resolve(null);
          }
        }
      });
      checkout.on('payment.failed', async (response) => {
        const reason = response?.error?.description || 'Payment failed';
        await markPaymentFailed(order.id, reason).catch(() => null);
        toast.error(reason);
      });
      checkout.open();
    });
  } catch (err) {
    console.error('Failed to start payment:', err);
    toast.error(err.response?.data?.detail || 'Failed to initialize payment.');
    return null;
  }
};
