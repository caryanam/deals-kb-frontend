// Helper utility functions

export const formatINR = (amount) => {
  if (amount === null || amount === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export const formatCurrency = formatINR;

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Base64 file converter helper
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
};

// Display labels mapping for backend product types
export const PRODUCT_TYPE_LABELS = {
  car: "Car",
  bike: "Bike",
  laptop: "Laptop",
  mobile: "Mobile",
};

// Safe JSON parser helper
export const safeParseJSON = (data, fallback = null) => {
  if (!data) return fallback;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    return fallback;
  }
};

// Canvas-based image compression utility
export const compressImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const getNameInitials = (name, fallback = 'Bidder') => {
  const normalized = String(name || '').trim();
  if (!normalized) return fallback;

  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${(parts[0][0] || '')}${(parts[parts.length - 1][0] || '')}`.toUpperCase();
};

export const formatRelativeTime = (timeInput) => {
  if (!timeInput) return 'Just now';
  try {
    const date = new Date(timeInput);
    if (isNaN(date.getTime())) {
      return timeInput;
    }
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin === 1) return '1m ago';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs === 1) return '1h ago';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString();
  } catch (e) {
    return timeInput;
  }
};

export const getBidderDisplayName = (bidderName, bidderId, currentUser) => {
  const name = String(bidderName || '').trim();
  if (!name) return 'Anonymous';
  
  // If currentUser exists and bidderId matches, show full name
  if (currentUser && bidderId && currentUser.user_id === bidderId) {
    return name;
  }
  
  // Otherwise, extract initials of the name
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Anonymous';
  if (parts.length === 1) {
    return `${parts[0][0].toUpperCase()}.`;
  }
  
  return parts.map(p => `${p[0].toUpperCase()}.`).join(' ');
};
