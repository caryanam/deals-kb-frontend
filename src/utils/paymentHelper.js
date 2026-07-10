import { createPaymentOrder, markPaymentFailed, verifyPayment } from '../api/paymentApi';
import { getCurrentUser } from '../api/authApi';
import { toast } from 'react-toastify';

const CASHFREE_CHECKOUT_SRC = 'https://sdk.cashfree.com/js/v3/cashfree.js';

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const getCashfreeFactory = () => window.Cashfree || globalThis.Cashfree;

const buildFailureReason = (result) => {
  const error = result?.error || {};
  return [
    error.message || error.description || error.reason || 'Payment failed',
    error.code ? `Code: ${error.code}` : '',
    error.type ? `Type: ${error.type}` : ''
  ].filter(Boolean).join(' | ');
};

const verifyCashfreeOrder = async (orderId, attempts = 5) => {
  let lastError = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await verifyPayment({ cashfree_order_id: orderId });
    } catch (err) {
      lastError = err;
      const detail = err.response?.data?.detail || '';
      const retriable = /payment not completed/i.test(detail) || /ACTIVE/i.test(detail);
      if (!retriable || attempt === attempts - 1) {
        break;
      }
      await sleep(1500);
    }
  }

  throw lastError || new Error('Payment verification failed');
};

export const loadCashfree = () =>
  new Promise((resolve) => {
    if (getCashfreeFactory()) {
      resolve(true);
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      resolve(false);
      return;
    }

    document
      .querySelectorAll(`script[src="${CASHFREE_CHECKOUT_SRC}"]`)
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
    script.src = CASHFREE_CHECKOUT_SRC;
    script.async = true;
    script.onload = () => finish(Boolean(getCashfreeFactory()));
    script.onerror = () => finish(false);
    document.body.appendChild(script);
  });

export const loadRazorpay = loadCashfree;

export const triggerPayment = async (planId, onSuccess, onCancel) => {
  try {
    const loaded = await loadCashfree();
    if (!loaded) {
      toast.error('Unable to load Cashfree Checkout. Please check your internet connection and try again.');
      return null;
    }

    const data = await createPaymentOrder(planId);
    const paymentSessionId = data.payment_session_id;
    const orderId = data.order_id;
    const mode = data.cashfree_mode === 'production' ? 'production' : 'sandbox';

    if (!paymentSessionId || !orderId) {
      toast.error('Cashfree order session could not be created.');
      return null;
    }

    const cashfreeFactory = getCashfreeFactory();
    if (typeof cashfreeFactory !== 'function') {
      toast.error('Cashfree SDK is not available.');
      return null;
    }

    const cashfree = cashfreeFactory({ mode });
    const result = await cashfree.checkout({
      paymentSessionId,
      redirectTarget: '_modal'
    });

    if (result?.error) {
      const reason = buildFailureReason(result);
      await markPaymentFailed(orderId, reason).catch(() => null);
      toast.error(reason);
      if (onCancel) onCancel();
      return null;
    }

    try {
      await verifyCashfreeOrder(orderId);

      const freshUser = await getCurrentUser();
      sessionStorage.setItem('user', JSON.stringify(freshUser));

      toast.success('Payment verified successfully.');
      if (onSuccess) onSuccess(freshUser);
      return freshUser;
    } catch (err) {
      console.error('Cashfree payment verification failed:', err);
      const detail = err.response?.data?.detail || 'Payment verification failed.';
      await markPaymentFailed(orderId, detail).catch(() => null);
      if (/payment not completed/i.test(detail)) {
        toast.info('Payment cancelled or not completed.');
      } else {
        toast.error(detail);
      }
      if (onCancel) onCancel();
      return null;
    }
  } catch (err) {
    console.error('Failed to start payment:', err);
    toast.error(err.response?.data?.detail || 'Failed to initialize Cashfree payment.');
    return null;
  }
};
