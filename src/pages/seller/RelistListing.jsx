import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Camera, CheckCircle2, FileText, Film, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { getRelistData, submitRelistAfterPayment, getProducts } from '../../api/productApi';
import { useAuth } from '../../hooks/useAuth';
import { compressImage, fileToBase64, safeParseJSON } from '../../utils/helpers';
import { normalizeImageUrl } from '../../utils/imageUtils';
import { getMyPlans } from '../../api/paymentApi';
import { triggerDealerPlanPayment, triggerRelistPayment } from '../../utils/paymentHelper';
import UpiPaymentModal from '../../components/payments/UpiPaymentModal';
import { getMyPayments } from '../../api/paymentApi';
import {
  BIKE_BRANDS,
  BIKE_BRAND_TO_MODELS,
  CAR_BRANDS,
  CAR_BRAND_TO_MODELS,
  LAPTOP_BRANDS,
  LAPTOP_BRAND_TO_MODELS,
  MOBILE_BRANDS,
  MOBILE_BRAND_TO_MODELS
} from '../../data/carLaptopData';

const MOBILE_RAM_OPTIONS = ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'];
const LAPTOP_RAM_OPTIONS = ['4GB', '8GB', '12GB', '16GB', '32GB', '64GB'];

const CATEGORIES = [
  { value: 'car', label: 'CAR' },
  { value: 'bike', label: 'BIKE' },
  { value: 'mobile', label: 'MOBILE' },
  { value: 'laptop', label: 'LAPTOP' }
];

const CONDITIONS = ['Excellent', 'Good', 'Average', 'Needs Repair'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Cng', 'Electric', 'Hybrid'];
const OWNERSHIP_OPTIONS = ['1st', '2nd', '3rd', '4th+'];
const FRONT_VIEW_SLOT = 'Front image';
const BACK_VIEW_SLOT = 'Back image';
const SIDE_VIEW_SLOT = 'Side view image';
const VEHICLE_IMAGE_FIELD_BY_SLOT = {
  [FRONT_VIEW_SLOT]: 'front_view_image',
  [BACK_VIEW_SLOT]: 'back_view_image',
  [SIDE_VIEW_SLOT]: 'side_view_image'
};
const isVehicleType = (type) => type === 'car' || type === 'bike';
const getExistingVehicleImage = (product, docs, field) => normalizeImageUrl(product?.[field] || docs?.[field]) || null;
const PHOTO_SLOTS = {
  car: [
    'Front image',
    'Back image',
    SIDE_VIEW_SLOT,
    'Dashboard',
    'Seat',
    'Tyre',
    'Engine',
    'Speedometer',
    'Damage image'
  ],
  bike: [
    'Front image',
    'Back image',
    SIDE_VIEW_SLOT,
    'Dashboard',
    'Seat',
    'Tyre',
    'Engine',
    'Speedometer',
    'Damage image'
  ],
  laptop: [
    'Front image',
    'Back image',
    'Barcode image',
    'Specification image',
    'Damage image'
  ],
  mobile: [
    'Front image',
    'Back image',
    'Specification image',
    'Damage image'
  ]
};

const isPhotoSlotRequired = (type, slot) => {
  if (type === 'car') {
    return [FRONT_VIEW_SLOT, BACK_VIEW_SLOT, SIDE_VIEW_SLOT, 'Dashboard', 'Speedometer', 'Engine'].includes(slot);
  }
  if (type === 'bike') {
    return [FRONT_VIEW_SLOT, BACK_VIEW_SLOT, SIDE_VIEW_SLOT, 'Dashboard', 'Engine'].includes(slot);
  }
  if (type === 'laptop') {
    return ['Front image', 'Back image', 'Barcode image', 'Specification image'].includes(slot);
  }
  if (type === 'mobile') {
    return ['Front image', 'Back image', 'Specification image'].includes(slot);
  }
  return false;
};

const initialSpecs = {
  year: '',
  kmDriven: '',
  insuranceStatus: '',
  fuelType: 'Petrol',
  ownership: '1st',
  accidental: 'No',
  processor: '',
  ram: '',
  storage: '',
  graphics: '',
  batteryBackup: '',
  batteryHealth: '',
  imeiNumber: '',
  warrantyAvailable: 'No'
};

const sectionTitle = {
  car: 'Car Details',
  bike: 'Bike Details',
  laptop: 'Laptop Details',
  mobile: 'Mobile Details'
};

const BRAND_MODEL_DATA = {
  car: {
    brands: CAR_BRANDS,
    modelsByBrand: CAR_BRAND_TO_MODELS,
    brandPlaceholder: 'Select Car Brand',
    modelPlaceholder: 'Select Car Model'
  },
  bike: {
    brands: BIKE_BRANDS,
    modelsByBrand: BIKE_BRAND_TO_MODELS,
    brandPlaceholder: 'Select Bike Brand',
    modelPlaceholder: 'Select Bike Model'
  },
  mobile: {
    brands: MOBILE_BRANDS,
    modelsByBrand: MOBILE_BRAND_TO_MODELS,
    brandPlaceholder: 'Select Mobile Brand',
    modelPlaceholder: 'Select Mobile Model'
  },
  laptop: {
    brands: LAPTOP_BRANDS,
    modelsByBrand: LAPTOP_BRAND_TO_MODELS,
    brandPlaceholder: 'Select Laptop Brand',
    modelPlaceholder: 'Select Laptop Model'
  }
};

export const RelistListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { listingId } = useParams();
  const basePath = user?.role === 'Dealer' ? '/dealer' : '/seller';

  const [showPaymentChoice, setShowPaymentChoice] = useState(false);
  const [paymentChoiceType, setPaymentChoiceType] = useState('SELLER');
  const [paymentChoicePlanId, setPaymentChoicePlanId] = useState('');
  const [listingAmount, setListingAmount] = useState(0);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [relistingId, setRelistingId] = useState('');

  const [productType, setProductType] = useState('car');
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [condition, setCondition] = useState('Good');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState(initialSpecs);

  const [photos, setPhotos] = useState([]);
  const [photoSlots, setPhotoSlots] = useState({});
  const [video, setVideo] = useState(null);
  const [rcCopy, setRcCopy] = useState(null);
  const [insuranceCopy, setInsuranceCopy] = useState(null);
  const [aadhaarCard, setAadhaarCard] = useState(null);
  const [panCard, setPanCard] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [dealerPlans, setDealerPlans] = useState([]);
  const brandModelData = BRAND_MODEL_DATA[productType];

  const [availableTitles, setAvailableTitles] = useState([]);
  const [loadingTitles, setLoadingTitles] = useState(false);

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        setLoadingTitles(true);
        const productsData = await getProducts();
        const titlesForCategory = new Set();
        
        const defaultTitles = {
          car: ['Honda City VMT 2021', 'Hyundai Creta SX 2020', 'Maruti Swift VXI 2019', 'Tata Nexon XZ 2022'],
          bike: ['Yamaha R15 V3 2021', 'Royal Enfield Classic 350 2020', 'Honda Activa 6G 2022', 'KTM Duke 200 2021'],
          mobile: ['Apple iPhone 13 128GB', 'Samsung Galaxy S22 Ultra', 'OnePlus 10 Pro 256GB', 'Apple iPhone 14 Pro Max'],
          laptop: ['Dell Inspiron 15 i5', 'HP Pavilion 14 Ryzen 5', 'Apple MacBook Air M2', 'Lenovo ThinkPad E14']
        };

        const normalizedType = (productType || '').toLowerCase().trim();
        (defaultTitles[normalizedType] || []).forEach(t => titlesForCategory.add(t));

        if (Array.isArray(productsData)) {
          productsData.forEach(p => {
            if (p.product_type?.toLowerCase()?.trim() === normalizedType && p.title) {
              titlesForCategory.add(p.title.trim());
            }
          });
        }
        
        setAvailableTitles(Array.from(titlesForCategory).sort());
      } catch (err) {
        console.error('Failed to fetch titles configuration:', err);
      } finally {
        setLoadingTitles(false);
      }
    };

    fetchTitles();
  }, [productType]);

  useEffect(() => {
    if (user?.role === 'Dealer') {
      getMyPlans()
        .then((plans) => {
          setDealerPlans(plans || []);
        })
        .catch((err) => {
          console.warn('Failed to load dealer plans:', err);
        });
    }
  }, [user]);

  const pillStyle = (selected) => ({
    border: selected ? '1px solid #111827' : '1px solid #d1d5db',
    backgroundColor: selected ? '#111827' : '#ffffff',
    color: selected ? '#ffffff' : '#374151',
    borderRadius: '999px',
    padding: '0.75rem 1.25rem',
    fontWeight: 800,
    cursor: 'not-allowed',
    minHeight: '44px',
    opacity: selected ? 1 : 0.9
  });
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  useEffect(() => {
    if (!listingId) return;

    const loadRelistData = async () => {
      try {
        setLoading(true);
        const product = await getRelistData(listingId);
        const parsedSpecs = safeParseJSON(product.specifications, {});
        const parsedDocs = safeParseJSON(product.documents, {});

        setProductType(product.product_type || 'car');
        setTitle(product.title || '');
        setBrand(product.brand || '');
        setMake(parsedSpecs.make || '');
        setModel(product.model || '');
        setCondition(product.condition || 'Good');
        setExpectedPrice(product.expected_price || '');
        setDescription(product.description || '');

        const loadedPhotos = safeParseJSON(product.photos, []).map(normalizeImageUrl);
        setPhotos(loadedPhotos);
        const slots = PHOTO_SLOTS[product.product_type || 'car'] || [];
        const nextSlots = {};
        loadedPhotos.forEach((img, idx) => {
          if (slots[idx]) {
            nextSlots[slots[idx]] = img;
          }
        });
        if (isVehicleType(product.product_type || '')) {
          Object.entries(VEHICLE_IMAGE_FIELD_BY_SLOT).forEach(([slotLabel, fieldName]) => {
            const existingImage = getExistingVehicleImage(product, parsedDocs, fieldName);
            if (existingImage) nextSlots[slotLabel] = existingImage;
          });
        }
        setPhotoSlots(nextSlots);

        setVideo(normalizeImageUrl(product.video) || null);
        setSpecs({
          ...initialSpecs,
          year: parsedSpecs.year || '',
          kmDriven: parsedSpecs.km_driven || '',
          insuranceStatus: parsedSpecs.insurance_status || '',
          fuelType: parsedSpecs.fuel_type || 'Petrol',
          ownership: parsedSpecs.ownership || '1st',
          accidental: parsedSpecs.accidental || 'No',
          processor: parsedSpecs.processor || '',
          ram: parsedSpecs.ram || '',
          storage: parsedSpecs.storage || '',
          graphics: parsedSpecs.graphics || '',
          batteryBackup: parsedSpecs.battery_backup || '',
          batteryHealth: parsedSpecs.battery_health || '',
          imeiNumber: parsedSpecs.imei_number || '',
          warrantyAvailable: parsedSpecs.warranty_available || 'No'
        });
        setRcCopy(parsedDocs.rc_copy || null);
        setInsuranceCopy(parsedDocs.insurance_copy || null);
        setAadhaarCard(parsedDocs.aadhaar_card || null);
        setPanCard(parsedDocs.pan_card || null);
      } catch (err) {
        console.error('Failed to load relist listing:', err);
        setErrorMsg('Failed to load listing data for relisting.');
      } finally {
        setLoading(false);
      }
    };

    loadRelistData();
  }, [listingId]);

  const updateSpec = (key, value) => {
    setSpecs((current) => ({ ...current, [key]: value }));
  };

  const handleBrandChange = (newBrand) => {
    setBrand(newBrand);
    setModel('');
    if (isVehicleType(productType)) {
      setMake(newBrand);
    }
  };

  const handlePhotoUpload = async (e, slotLabel) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file, 1024, 1024, 0.7);
      const processedFile = dataURLtoFile(compressedDataUrl, file.name);
      setPhotoSlots((current) => {
        const next = { ...current, [slotLabel]: processedFile };
        setPhotos(Object.values(next).filter(Boolean));
        return next;
      });
    } catch {
      setPhotoSlots((current) => {
        const next = { ...current, [slotLabel]: file };
        setPhotos(Object.values(next).filter(Boolean));
        return next;
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleDocUpload = async (e, setter) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.type.startsWith('image/')) {
        const compressedDataUrl = await compressImage(file, 1024, 1024, 0.7);
        const processedFile = dataURLtoFile(compressedDataUrl, file.name);
        setter(processedFile);
      } else {
        setter(file);
      }
    } catch {
      setter(file);
    } finally {
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setErrorMsg('Please upload a valid video file.');
      return;
    }
    setVideo(file);
    e.target.value = '';
  };

  const buildPayload = () => {
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('category', productType.toUpperCase());
    formData.append('brand', brand.trim());
    formData.append('model', model.trim());
    formData.append('condition', condition);
    formData.append('description', description.trim());
    formData.append('expected_price', Number(expectedPrice));

    const specifications = {
      warranty_available: specs.warrantyAvailable
    };

    const finalMake = isVehicleType(productType) ? brand : make;
    if (finalMake.trim()) specifications.make = finalMake.trim();

    if (aadhaarCard) formData.append('aadhaar_card', aadhaarCard);
    if (panCard) formData.append('pan_card', panCard);

    if (isVehicleType(productType)) {
      Object.assign(specifications, {
        year: Number(specs.year),
        km_driven: Number(specs.kmDriven),
        insurance_status: specs.insuranceStatus.trim(),
        fuel_type: specs.fuelType,
        ownership: specs.ownership,
        accidental: specs.accidental
      });
      if (rcCopy) formData.append('rc_copy', rcCopy);
      if (insuranceCopy) formData.append('insurance_copy', insuranceCopy);
      Object.entries(VEHICLE_IMAGE_FIELD_BY_SLOT).forEach(([slotLabel, fieldName]) => {
        const fileOrUrl = photoSlots[slotLabel];
        if (fileOrUrl) formData.append(fieldName, fileOrUrl);
      });
    }

    if (productType === 'laptop') {
      Object.assign(specifications, {
        processor: specs.processor.trim(),
        ram: specs.ram.trim(),
        storage: specs.storage.trim()
      });
      if (specs.batteryBackup.trim()) specifications.battery_backup = specs.batteryBackup.trim();
      if (specs.graphics.trim()) specifications.graphics = specs.graphics.trim();
      if (specs.batteryHealth.trim()) specifications.battery_health = specs.batteryHealth.trim();
    }

    if (productType === 'mobile') {
      Object.assign(specifications, {
        ram: specs.ram.trim(),
        storage: specs.storage.trim()
      });
      if (specs.imeiNumber.trim()) specifications.imei_number = specs.imeiNumber.trim();
    }

    formData.append('specifications', JSON.stringify(specifications));

    Object.entries(photoSlots).forEach(([slotLabel, val]) => {
      if (!val) return;
      if (isVehicleType(productType) && slotLabel === SIDE_VIEW_SLOT) return;
      formData.append('photos', val);
    });

    if (video) {
      formData.append('video', video);
    }

    return formData;
  };

  const validateForm = () => {
    if (!title.trim() || !brand.trim() || !model.trim()) return 'Please complete title, brand, and model.';
    
    if (!description.trim() || description.trim().length < 10) {
      return 'Description must be at least 10 characters long.';
    }
    
    if (!expectedPrice || Number(expectedPrice) < 10) return 'Expected price must be at least ₹10.';
    if (!video) return 'Video walkthrough is required.';

    // Mandatory Photo Validation
    if (productType === 'car') {
      if (!photoSlots['Front image']) return 'Front image of the car is mandatory.';
      if (!photoSlots['Back image']) return 'Back image of the car is mandatory.';
      if (!photoSlots[SIDE_VIEW_SLOT]) return 'Side view image of the car is mandatory.';
      if (!photoSlots['Dashboard']) return 'Dashboard image of the car is mandatory.';
      if (!photoSlots['Speedometer']) return 'Speedometer image of the car is mandatory.';
      if (!photoSlots['Engine']) return 'Engine image of the car is mandatory.';
    }

    if (productType === 'bike') {
      if (!photoSlots['Front image']) return 'Front image of the bike is mandatory.';
      if (!photoSlots['Back image']) return 'Back image of the bike is mandatory.';
      if (!photoSlots[SIDE_VIEW_SLOT]) return 'Side view image of the bike is mandatory.';
      if (!photoSlots['Dashboard']) return 'Dashboard image of the bike is mandatory.';
      if (!photoSlots['Engine']) return 'Engine image of the bike is mandatory.';
    }

    if (productType === 'laptop') {
      if (!photoSlots['Front image']) return 'Front image of the laptop is mandatory.';
      if (!photoSlots['Back image']) return 'Back image of the laptop is mandatory.';
      if (!photoSlots['Barcode image']) return 'Barcode image of the laptop is mandatory.';
      if (!photoSlots['Specification image']) return 'Specification image of the laptop is mandatory.';
    }

    if (productType === 'mobile') {
      if (!photoSlots['Front image']) return 'Front image of the mobile is mandatory.';
      if (!photoSlots['Back image']) return 'Back image of the mobile is mandatory.';
      if (!photoSlots['Specification image']) return 'Specification image of the mobile is mandatory.';
    }

    if (!aadhaarCard || !panCard) return 'Aadhaar Card and PAN Card are required.';

    if (isVehicleType(productType)) {
      if (!specs.ownership || !specs.accidental) return 'Please select ownership and accidental status.';
      if (!rcCopy || !insuranceCopy) return 'RC Document and Insurance Document are required.';
      
      if (specs.year) {
        const yearNum = parseInt(specs.year, 10);
        const currentYear = new Date().getFullYear();
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear) {
          return `Manufacturing year must be between 1900 and ${currentYear}.`;
        }
      }
      if (specs.kmDriven) {
        const kmNum = Number(specs.kmDriven);
        if (isNaN(kmNum) || kmNum < 0) {
          return 'Kilometer driven must be a positive number.';
        }
      }
    }

    if (productType === 'laptop') {
      if (!specs.ram.trim() || !specs.storage.trim()) {
        return 'RAM and Storage are required.';
      }
      const storageStr = specs.storage.trim();
      if (storageStr.includes('.')) {
        return 'Storage must be a whole number (no decimals).';
      }
      const storageDigits = storageStr.replace(/\D/g, '');
      const storageNum = parseInt(storageDigits, 10);
      if (isNaN(storageNum) || storageNum < 10) {
        return 'Storage must be at least 10 GB.';
      }
    }

    if (productType === 'mobile') {
      if (!specs.ram.trim() || !specs.storage.trim()) return 'Storage and RAM are required.';
      
      const storageStr = specs.storage.trim();
      if (storageStr.includes('.')) {
        return 'Storage must be a whole number (no decimals).';
      }
      const storageDigits = storageStr.replace(/\D/g, '');
      const storageNum = parseInt(storageDigits, 10);
      if (isNaN(storageNum) || storageNum < 10) {
        return 'Storage must be at least 10 GB.';
      }

      const imeiStr = (specs.imeiNumber || '').trim();
      if (imeiStr && !/^\d{15}$/.test(imeiStr)) {
        return 'IMEI number must be exactly 15 digits.';
      }
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const validation = validateForm();
    if (validation) {
      setErrorMsg(validation);
      return;
    }

    const formData = buildPayload();
    setLoading(true);

    try {
      if (user?.role === 'Dealer') {
        const planId = productType === 'car'
          ? 'dealer_car_monthly'
          : productType === 'mobile'
          ? 'dealer_mobile_monthly'
          : 'dealer_laptop_bike_monthly';

        const hasActivePlan = dealerPlans.some(p => p.plan_id === planId && p.active);

        if (hasActivePlan) {
          await submitRelistAfterPayment(listingId, formData);
          toast.success('Listing relisted successfully under your active plan!');
          setSuccessMsg('Listing submitted for admin approval. Redirecting...');
          setTimeout(() => navigate(`${basePath}/my-listings`), 1200);
        } else {
          // Save details first
          await submitRelistAfterPayment(listingId, formData);
          setPaymentChoiceType('DEALER');
          setPaymentChoicePlanId(planId);
          const amt = 1.00;
          setListingAmount(amt);
          setShowPaymentChoice(true);
          setSuccessMsg('Please choose your payment option.');
        }
      } else {
        // Regular Seller pays for each relisting
        // Save details first
        await submitRelistAfterPayment(listingId, formData);
        setRelistingId(listingId);
        setPaymentChoiceType('SELLER');
        const amt = 1.00;
        setListingAmount(amt);
        // Fetch latest payments to check for already-pending UPI
        try {
          const myPays = await getMyPayments();
          setPendingPayments(Array.isArray(myPays) ? myPays : []);
        } catch (_) { setPendingPayments([]); }
        setShowPaymentChoice(true);
        setSuccessMsg('Please choose your payment option.');
      }
    } catch (err) {
      console.error('Relisting submit failed:', err);
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to submit relisted listing.';
      toast.error(msg);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page listing-form-page" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '1.5rem 0' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1F1A1D', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            Relist Product in Marketplace
          </h1>
          <p style={{ color: '#8B8278', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            Modify details below and submit. Re-submission requires a category listing fee.
          </p>
        </div>

        {successMsg && (
          <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '0.75rem', display: 'flex', gap: '0.65rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            <CheckCircle2 style={{ color: '#10b981', flexShrink: 0 }} size={20} />
            <span style={{ color: '#065f46', fontSize: '0.85rem', fontWeight: 600 }}>{successMsg}</span>
          </div>
        )}

        <form className="responsive-listing-form responsive-listing-form--relist" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <section className="card">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>General Details</h2>
              
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Category</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      disabled={true}
                      style={pillStyle(productType === cat.value)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {user?.role === 'Dealer' ? (() => {
                const planId = productType === 'car'
                  ? 'dealer_car_monthly'
                  : productType === 'mobile'
                  ? 'dealer_mobile_monthly'
                  : 'dealer_laptop_bike_monthly';
                const isActive = dealerPlans.some(p => p.plan_id === planId && p.active);
                const planName = productType === 'car'
                  ? 'Dealer Car Plan'
                  : productType === 'mobile'
                  ? 'Dealer Mobile Plan'
                  : 'Dealer Laptop & Bike Plan';
                return (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '0.75rem',
                    backgroundColor: isActive ? '#f0fdf4' : '#fef2f2',
                    border: isActive ? '1px solid #bbf7d0' : '1px solid #fca5a5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ color: isActive ? '#166534' : '#991b1b', fontWeight: 800, fontSize: '0.9rem' }}>
                      {planName} Status
                    </span>
                    <strong style={{
                      padding: '0.25rem 0.55rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
                      color: isActive ? '#166534' : '#991b1b'
                    }}>
                      {isActive ? 'Active' : 'Inactive (Payment needed)'}
                    </strong>
                  </div>
                );
              })() : (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.75rem',
                  backgroundColor: '#F5ECDD',
                  border: '1px solid #D8CFC1',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <span style={{ color: '#7A2181', fontWeight: 800, fontSize: '0.9rem' }}>Relisting Fee</span>
                  <strong style={{ color: '#1F1A1D', fontSize: '1.2rem' }}>{"\u20B9"}1</strong>
                </div>
              )}

              <Input
                label="Listing Title *"
                value={title}
                onChange={setTitle}
                placeholder="Enter listing title"
              />
              
              <div className="responsive-fields-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Select label="Brand *" value={brand} onChange={handleBrandChange} options={brandModelData?.brands || []} placeholder={brandModelData?.brandPlaceholder || ''} />
                <Select label="Model *" value={model} onChange={setModel} options={brandModelData?.modelsByBrand?.[brand] || []} placeholder={brand ? (brandModelData?.modelPlaceholder || '') : 'Select Brand First'} disabled={!brand} />
              </div>
            </section>

            <section className="card">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>{sectionTitle[productType]}</h2>
              {isVehicleType(productType) && (
                <>
                  <div className="responsive-fields-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
                    <Input label="Manufacturing Year" type="number" value={specs.year} onChange={(v) => updateSpec('year', v)} placeholder="e.g. 2020" />
                    <Input label="Kilometer Driven" type="number" value={specs.kmDriven} onChange={(v) => updateSpec('kmDriven', v)} placeholder="e.g. 45000" />
                    <Input label="Insurance Details" value={specs.insuranceStatus} onChange={(v) => updateSpec('insuranceStatus', v)} placeholder="e.g. Valid till March 2026" />
                  </div>
                  <ChipGroup label="Fuel Type" options={FUEL_TYPES} value={specs.fuelType} onChange={(v) => updateSpec('fuelType', v)} />
                  <ChipGroup label="Ownership *" options={OWNERSHIP_OPTIONS} value={specs.ownership} onChange={(v) => updateSpec('ownership', v)} />
                  <Segmented label="Accidental *" options={['No', 'Yes']} value={specs.accidental} onChange={(v) => updateSpec('accidental', v)} />
                </>
              )}

              {productType === 'laptop' && (
                <>
                  <div className="responsive-fields-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
                    <Input label="Processor" value={specs.processor} onChange={(v) => updateSpec('processor', v)} placeholder="e.g. Intel i5 / Ryzen 5" />
                    <Select label="RAM *" value={specs.ram} onChange={(v) => updateSpec('ram', v)} options={LAPTOP_RAM_OPTIONS} placeholder="Select RAM" required={true} />
                    <Input label="Storage *" value={specs.storage} onChange={(v) => updateSpec('storage', v)} placeholder="e.g. 512GB SSD" />
                  </div>
                  <div className="responsive-fields-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
                    <Input label="Graphics Card" value={specs.graphics} onChange={(v) => updateSpec('graphics', v)} placeholder="Graphics card" />
                    <Input label="Battery Backup" value={specs.batteryBackup} onChange={(v) => updateSpec('batteryBackup', v)} placeholder="e.g. 3-4 hours" />
                    <Input label="Battery Health" value={specs.batteryHealth} onChange={(v) => updateSpec('batteryHealth', v)} placeholder="Battery health" />
                  </div>
                </>
              )}

              {productType === 'mobile' && (
                <>
                  <div className="responsive-fields-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
                     <Input label="Storage *" value={specs.storage} onChange={(v) => updateSpec('storage', v)} placeholder="e.g. 128GB" />
                     <Select label="RAM *" value={specs.ram} onChange={(v) => updateSpec('ram', v)} options={MOBILE_RAM_OPTIONS} placeholder="Select RAM" required={true} />
                     <Input label="IMEI Number" value={specs.imeiNumber} onChange={(v) => updateSpec('imeiNumber', v)} placeholder="IMEI Number" />
                  </div>
                </>
              )}

              {(productType === 'laptop' || productType === 'mobile') && (
                <>
                  <ChipGroup label="Condition *" options={CONDITIONS} value={condition} onChange={setCondition} />
                  <Segmented label="Warranty Available?" options={['No', 'Yes']} value={specs.warrantyAvailable} onChange={(v) => updateSpec('warrantyAvailable', v)} />
                </>
              )}
            </section>

            <section className="card">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>Price & Description</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                <Input label="Expected Price Rs *" type="number" value={expectedPrice} onChange={setExpectedPrice} placeholder="e.g. 450000" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="description">Description</label>
                <textarea id="description" className="form-control" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write product condition, features, reason for selling..." />
              </div>
            </section>
          </div>

          <div className="responsive-form-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div className="card">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>Product Photos</h2>
              <div className="responsive-photo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' }}>
                {(PHOTO_SLOTS[productType] || []).map((slot) => (
                  <PhotoSlot
                    key={slot}
                    label={slot}
                    value={photoSlots[slot]}
                    required={isPhotoSlotRequired(productType, slot)}
                    onUpload={(e) => handlePhotoUpload(e, slot)}
                    onRemove={() => {
                      setPhotoSlots((current) => {
                        const next = { ...current };
                        delete next[slot];
                        setPhotos(Object.values(next).filter(Boolean));
                        return next;
                      });
                    }}
                  />
                ))}
              </div>
            </div>

            {isVehicleType(productType) && (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem' }}>Admin Documents *</h2>
                <UploadRow label="RC Document" file={rcCopy} onUpload={(e) => handleDocUpload(e, setRcCopy)} onRemove={() => setRcCopy(null)} />
                <UploadRow label="Insurance Document" file={insuranceCopy} onUpload={(e) => handleDocUpload(e, setInsuranceCopy)} onRemove={() => setInsuranceCopy(null)} />
              </div>
            )}

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem' }}>KYC Documents *</h2>
              <UploadRow label="Aadhaar Card" file={aadhaarCard} onUpload={(e) => handleDocUpload(e, setAadhaarCard)} onRemove={() => setAadhaarCard(null)} />
              <UploadRow label="PAN Card" file={panCard} onUpload={(e) => handleDocUpload(e, setPanCard)} onRemove={() => setPanCard(null)} />
            </div>

            <div className="card">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>Upload Video Walkthrough *</h2>
              <p style={{ fontSize: '0.82rem', color: '#8B8278', margin: '-0.35rem 0 0.85rem', fontWeight: 700 }}>
                Video length should be between 10-15 sec max.
              </p>
              {!video ? (
                <label style={{ border: '1px dashed #cbd5e1', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center', position: 'relative', backgroundColor: '#FAF6EA', display: 'block', cursor: 'pointer' }}>
                  <Film size={24} style={{ color: '#6B1B71', marginBottom: '0.25rem' }} />
                  <p style={{ fontSize: '0.85rem', color: '#8B8278', margin: 0, fontWeight: 700 }}>Select video walkthrough</p>
                  <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                </label>
              ) : (
                <UploadedBadge label="Video Walkthrough Uploaded" onRemove={() => setVideo(null)} />
              )}
            </div>

            <div className="responsive-form-actions" style={{ display: 'flex', alignItems: 'stretch', gap: '0.85rem', flexWrap: 'wrap' }}>
              {errorMsg && (
                <div style={{ flex: '2 1 280px', minHeight: '48px', display: 'flex', alignItems: 'center', gap: '0.65rem', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '0.7rem 0.85rem', borderRadius: '0.85rem', color: '#dc2626', lineHeight: 1.3, fontWeight: 800, fontSize: '0.86rem' }}>
                  <AlertTriangle style={{ color: '#ef4444', flexShrink: 0 }} size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => navigate(`${basePath}/my-listings`)}
                className="btn btn-secondary"
                disabled={loading}
                style={{ flex: '1 1 120px', height: '48px', fontWeight: 700, borderRadius: '999px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: '1.4 1 180px', height: '48px', fontWeight: 800, borderRadius: '999px' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" style={{ marginRight: '0.5rem' }} /> Relisting...
                  </>
                ) : (
                  'Relist for Approval'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Payment Choice Modal */}      {showPaymentChoice && (() => {
        const hasPendingForListing = pendingPayments.some(
          (p) => p.status === 'PENDING' && p.payment_gateway === 'UPI' &&
            (p.listing_id === relistingId || p.plan_id === paymentChoicePlanId)
        );
        return (
          <div style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10500, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '1rem'
          }}>
            <div style={{
              width: '100%', maxWidth: '380px',
              backgroundColor: '#FAF6EA', borderRadius: '1.25rem',
              border: '1.5px solid #D8CFC1',
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
              padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem'
            }}>
              {hasPendingForListing ? (
                <>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#1F1A1D', textAlign: 'center' }}>
                    Payment Request Submitted
                  </h3>
                  <div style={{
                    backgroundColor: '#fef9c3', border: '1.5px solid #fbbf24',
                    borderRadius: '0.85rem', padding: '1rem', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>⏳</span>
                    <p style={{ margin: 0, fontWeight: 800, color: '#92400e', fontSize: '0.9rem' }}>
                      Payment Awaiting Admin Approval
                    </p>
                    <p style={{ margin: 0, fontWeight: 600, color: '#78350f', fontSize: '0.8rem', lineHeight: 1.45 }}>
                      Your UPI payment request has already been submitted and is pending admin verification. You'll be notified once approved. No need to pay again.
                    </p>
                  </div>
                  <button
                    onClick={() => { setShowPaymentChoice(false); navigate(`${basePath}/my-listings`); }}
                    className="btn btn-secondary"
                    style={{ width: '100%', height: '40px', borderRadius: '999px', fontWeight: 800, border: '1.5px solid #D8CFC1' }}
                  >
                    Go to My Listings
                  </button>
                </>
              ) : (
                <>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#1F1A1D', textAlign: 'center' }}>
                    Choose Payment Method
                  </h3>
                  <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '0.75rem', padding: '0.6rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400e', display: 'block' }}>
                      🔥 LAUNCH OFFER TILL 31st AUGUST
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#1F1A1D', marginTop: '0.15rem', display: 'block' }}>
                      Pay only <span style={{ textDecoration: 'line-through', color: '#8B8278', fontSize: '0.78rem', marginRight: '0.25rem' }}>₹{paymentChoiceType === 'DEALER' ? (paymentChoicePlanId.includes('car') ? '3538.82' : paymentChoicePlanId.includes('laptop') ? '2358.82' : '1178.82') : ({ mobile: '11.80', laptop: '59.00', bike: '118.00', car: '590.00' }[productType?.toLowerCase()] || '590.00')}</span> <span style={{ color: '#16a34a', fontSize: '1.1rem' }}>₹1.00</span>
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      setShowPaymentChoice(false);
                      if (paymentChoiceType === 'DEALER') {
                        await triggerDealerPlanPayment(paymentChoicePlanId);
                      } else {
                        await triggerSellerListingPayment(relistingId);
                      }
                      navigate(`${basePath}/my-listings`);
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', height: '42px', borderRadius: '999px', fontWeight: 900, border: 'none', boxShadow: '0 4px 12px rgba(107,27,113,0.18)' }}
                  >
                    Pay via NetBanking (CCAvenue)
                  </button>
                  <button
                    onClick={() => { setShowPaymentChoice(false); setShowUpiModal(true); }}
                    className="btn btn-secondary"
                    style={{ width: '100%', height: '42px', borderRadius: '999px', fontWeight: 900, border: '1.5px solid #D8CFC1', backgroundColor: '#ffffff' }}
                  >
                    Pay via UPI / QR Scan
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {showUpiModal && (
        <UpiPaymentModal
          isOpen={showUpiModal}
          onClose={() => {
            setShowUpiModal(false);
            navigate(`${basePath}/my-listings`);
          }}
          amount={listingAmount}
          planName={paymentChoiceType === 'DEALER' ? 'Dealer Upgrade' : `${productType.toUpperCase()} Relisting Fee`}
          paymentType={paymentChoiceType === 'DEALER' ? 'DEALER_PLAN' : 'SELLER_LISTING'}
          planId={paymentChoiceType === 'DEALER' ? paymentChoicePlanId : undefined}
          listingId={paymentChoiceType === 'SELLER' ? listingId : undefined}
          onSuccess={() => {
            toast.success("UPI relisting payment request submitted successfully!");
          }}
        />
      )}
    </div>
  );
};

const TITLE_PLACEHOLDERS = {
  car: 'e.g. Hyundai Creta 2020 â€“ well maintained',
  bike: 'e.g. Yamaha R15 2021 â€“ minor scratches',
  mobile: 'e.g. iPhone 13 128GB â€“ good condition',
  laptop: 'e.g. Dell Inspiron i5 â€“ lightly used'
};

const Input = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}</label>}
    <input type={type} className="form-control" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ borderRadius: '0.55rem' }} />
  </div>
);

const Select = ({ label, value, onChange, options, placeholder, disabled = false, required = false }) => (
  <div className="form-group" style={{ marginBottom: 0 }}>
    {label && <label className="form-label">{label}</label>}
    <select
      className="form-control"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
      style={{
        width: '100%',
        padding: '0.85rem 1.15rem',
        borderRadius: '0.85rem',
        border: '1px solid #d1d5db',
        backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
        color: disabled ? '#9ca3af' : '#1F1A1D',
        fontSize: '0.9rem',
        fontWeight: 600,
        outline: 'none',
        appearance: 'none',
        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%238B8278\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        backgroundSize: '1.2em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        height: '50px'
      }}
    >
      <option value="">{placeholder || 'Select option'}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const ChipGroup = ({ label, options, value, onChange }) => (
  <div className="form-group" style={{ marginBottom: 0 }}>
    <label className="form-label">{label}</label>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          style={{
            border: value === option ? '1px solid #111827' : '1px solid #d1d5db',
            backgroundColor: value === option ? '#111827' : '#ffffff',
            color: value === option ? '#ffffff' : '#374151',
            borderRadius: '999px',
            padding: '0.7rem 1.15rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

const Segmented = ({ label, options, value, onChange }) => (
  <div className="form-group" style={{ marginBottom: 0 }}>
    <label className="form-label">{label}</label>
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: '0.75rem' }}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          style={{
            border: value === option ? '1px solid #111827' : '1px solid #d1d5db',
            backgroundColor: value === option ? '#111827' : '#ffffff',
            color: value === option ? '#ffffff' : '#374151',
            borderRadius: '0.85rem',
            minHeight: '50px',
            fontWeight: 900,
            cursor: 'pointer'
          }}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

const PhotoSlot = ({ label, value, onUpload, onRemove, required }) => {
  const [previewUrl, setPreviewUrl] = React.useState('');

  React.useEffect(() => {
    if (!value) {
      setPreviewUrl('');
      return undefined;
    }

    if (typeof value === 'string') {
      setPreviewUrl(value);
      return undefined;
    }

    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreviewUrl('');
    return undefined;
  }, [value]);

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.85rem', padding: '0.75rem', minHeight: '112px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.65rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
        <Camera size={20} style={{ color: '#4a1a50', flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <span style={{ fontWeight: 850, color: '#111827', fontSize: '0.9rem', lineHeight: 1.25 }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
          </span>
          {([FRONT_VIEW_SLOT, BACK_VIEW_SLOT, SIDE_VIEW_SLOT].includes(label)) && (
            <p style={{ margin: '0.15rem 0 0', color: '#8B8278', fontSize: '0.72rem', fontWeight: 700, lineHeight: 1.25 }}>
              Note: number plate should be hidden or unreadable.
            </p>
          )}
        </div>
      </div>
      {previewUrl ? (
        <div style={{ height: '72px', borderRadius: '0.65rem', overflow: 'hidden', position: 'relative', border: '1px solid #d1fae5' }}>
          <img src={previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button type="button" onClick={onRemove} style={{ position: 'absolute', top: 5, right: 5, border: 'none', background: '#ef4444', color: '#ffffff', borderRadius: '50%', width: 22, height: 22, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <X size={13} />
          </button>
        </div>
      ) : (
        <label style={{ border: '1px dashed #cbd5e1', borderRadius: '0.65rem', minHeight: '58px', display: 'grid', placeItems: 'center', color: '#6B1B71', fontWeight: 900, cursor: 'pointer', position: 'relative', backgroundColor: '#FAF6EA' }}>
          Upload
          <input type="file" accept="image/*" onChange={onUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
        </label>
      )}
    </div>
  );
};

const UploadRow = ({ label, file, onUpload, onRemove }) => (
  <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.85rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
      <FileText size={28} style={{ color: '#4a1a50', flexShrink: 0 }} />
      <div>
        <p style={{ margin: 0, fontWeight: 900, color: '#111827' }}>{label}</p>
        <p style={{ margin: '0.15rem 0 0', color: file ? '#047857' : '#8B8278', fontSize: '0.85rem', fontWeight: 700 }}>
          {file ? 'Uploaded' : 'Tap to upload image'}
        </p>
      </div>
    </div>
    {file ? (
      <button type="button" onClick={onRemove} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
        <X size={18} />
      </button>
    ) : (
      <label style={{ color: '#6B1B71', fontWeight: 900, cursor: 'pointer', position: 'relative' }}>
        Upload
        <input type="file" accept="image/*,application/pdf" onChange={onUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
      </label>
    )}
  </div>
);

const UploadedBadge = ({ label, onRemove }) => (
  <div style={{ padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '0.75rem', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 800 }}>{label}</span>
    <button type="button" onClick={onRemove} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
      <X size={16} />
    </button>
  </div>
);

export default RelistListing;


