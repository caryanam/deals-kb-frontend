import { createCCAvenuePayment } from '../api/paymentApi';
import { createRelistOrder } from '../api/productApi';
import { toast } from 'react-toastify';

const submitCCAvenueForm = ({ gateway_url, enc_request, access_code }) => {
  if (!gateway_url || !enc_request || !access_code) {
    throw new Error('CCAvenue payment session could not be created.');
  }

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = gateway_url;
  form.style.display = 'none';

  const encInput = document.createElement('input');
  encInput.type = 'hidden';
  encInput.name = 'encRequest';
  encInput.value = enc_request;
  form.appendChild(encInput);

  const accessInput = document.createElement('input');
  accessInput.type = 'hidden';
  accessInput.name = 'access_code';
  accessInput.value = access_code;
  form.appendChild(accessInput);

  document.body.appendChild(form);
  form.submit();
};

export const triggerPayment = async (payload, onSuccess, onCancel) => {
  try {
    const requestPayload = typeof payload === 'string'
      ? { payment_type: 'BUYER_PASS', plan_id: payload }
      : payload;

    const data = await createCCAvenuePayment(requestPayload);
    if (data?.free_activated || data?.status === 'SUCCESS') {
      toast.success(data.message || 'Independence Day ₹0 Offer Activated Successfully!');
      if (onSuccess) onSuccess(data);
      return data;
    }

    sessionStorage.setItem('pending_payment_order_id', data.order_id || '');
    toast.info('Redirecting to secure CCAvenue checkout...');
    submitCCAvenueForm(data);
    if (onSuccess) onSuccess(data);
    return data;
  } catch (err) {
    console.error('Failed to start CCAvenue payment:', err);
    toast.error(err.response?.data?.detail || err.message || 'Failed to initialize payment.');
    if (onCancel) onCancel();
    return null;
  }
};

export const triggerBuyerPassPayment = (planId, onSuccess, onCancel) =>
  triggerPayment({ payment_type: 'BUYER_PASS', plan_id: planId }, onSuccess, onCancel);

export const triggerDealerPlanPayment = (planId, onSuccess, onCancel) =>
  triggerPayment({ payment_type: 'DEALER_PLAN', plan_id: planId }, onSuccess, onCancel);

export const triggerSellerListingPayment = (listingId, onSuccess, onCancel) =>
  triggerPayment({ payment_type: 'SELLER_LISTING', listing_id: listingId }, onSuccess, onCancel);

export const triggerRelistPayment = async (productId, onSuccess, onCancel) => {
  try {
    const data = await createRelistOrder(productId);
    sessionStorage.setItem('pending_payment_order_id', data.order_id || '');
    toast.info('Redirecting to secure CCAvenue checkout...');
    submitCCAvenueForm(data);
    if (onSuccess) onSuccess(data);
    return data;
  } catch (err) {
    console.error('Failed to start CCAvenue payment for relisting:', err);
    toast.error(err.response?.data?.detail || err.message || 'Failed to initialize payment.');
    if (onCancel) onCancel();
    return null;
  }
};
