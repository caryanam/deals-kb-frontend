import { createPaymentOrder, markPaymentFailed, verifyPayment } from '../api/paymentApi';
import { getCurrentUser } from '../api/authApi';
import { toast } from 'react-toastify';

const RAZORPAY_CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

const buildFailureReason = (response) => {
  const error = response?.error || {};
  return [
    error.description || error.reason || 'Payment failed',
    error.code ? `Code: ${error.code}` : '',
    error.source ? `Source: ${error.source}` : '',
    error.step ? `Step: ${error.step}` : ''
  ].filter(Boolean).join(' | ');
};

const buildPrefill = (prefill = {}) => {
  const cleanedContact = String(prefill.contact || '').replace(/\D/g, '').slice(-10);
  const safePrefill = {
    name: prefill.name || 'DealsKB User'
  };

  if (prefill.email) {
    safePrefill.email = prefill.email;
  }

  if (/^[6-9]\d{9}$/.test(cleanedContact)) {
    safePrefill.contact = cleanedContact;
  }

  return safePrefill;
};

export const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      resolve(false);
      return;
    }

    document
      .querySelectorAll(`script[src="${RAZORPAY_CHECKOUT_SRC}"]`)
      .forEach((script) => script.remove());

    const script = document.createElement('script');
    let settled = false;
    const finish = (loaded) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      if (!loaded) script.remove();
      resolve(loaded);
    };
    const timeoutId = window.setTimeout(() => finish(false), 15000);
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.async = true;
    script.onload = () => finish(Boolean(window.Razorpay));
    script.onerror = () => finish(false);
    document.body.appendChild(script);
  });

export const triggerPayment = async (planId, onSuccess, onCancel) => {
  try {
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error('Unable to load Razorpay Checkout. Please check your internet connection and try again.');
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
        prefill: buildPrefill(data.prefill),
        notes: order.notes || {},
        retry: {
          enabled: true,
          max_count: 1
        },
        theme: { color: '#6B1B71' },
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
        console.error('Razorpay payment.failed:', response);
        const reason = buildFailureReason(response);
        await markPaymentFailed(order.id, reason).catch(() => null);
        toast.error(reason);
        if (onCancel) onCancel();
        resolve(null);
      });
      checkout.open();
    });
  } catch (err) {
    console.error('Failed to start payment:', err);
    toast.error(err.response?.data?.detail || 'Failed to initialize payment.');
    return null;
  }
};
