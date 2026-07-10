import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Camera, CheckCircle2, FileText, Film, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { getRelistData, createRelistOrder, submitRelistAfterPayment, markRelistPaymentFailed } from '../../api/productApi';
import { useAuth } from '../../hooks/useAuth';
import { compressImage, fileToBase64, safeParseJSON } from '../../utils/helpers';
import { loadCashfree } from '../../utils/paymentHelper';
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

const CATEGORIES = [
  { value: 'car', label: 'CAR' },
  { value: 'bike', label: 'BIKE' },
  { value: 'mobile', label: 'MOBILE' },
  { value: 'laptop', label: 'LAPTOP' }
];

const CONDITIONS = ['Excellent', 'Good', 'Average', 'Needs Repair'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Cng', 'Electric', 'Hybrid'];
const OWNERSHIP_OPTIONS = ['1st', '2nd', '3rd', '4th+'];
const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const buildCashfreeFailureReason = (result) => {
  const error = result?.error || {};
  return [
    error.message || error.description || error.reason || 'Payment cancelled or failed',
    error.code ? `Code: ${error.code}` : ''
  ].filter(Boolean).join(' | ');
};

const PHOTO_SLOTS = {
  car: [
    'Front image',
    'Back image',
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
    return ['Front image', 'Back image', 'Dashboard', 'Speedometer', 'Engine'].includes(slot);
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

  const [productType, setProductType] = useState('car');
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [condition, setCondition] = useState('Good');
  const [productPrice, setProductPrice] = useState('');
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
  const brandModelData = BRAND_MODEL_DATA[productType];

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
        setProductPrice(product.product_price || '');
        setExpectedPrice(product.expected_price || '');
        setDescription(product.description || '');

        const loadedPhotos = safeParseJSON(product.photos, []);
        setPhotos(loadedPhotos);
        const slots = PHOTO_SLOTS[product.product_type || 'car'] || [];
        const nextSlots = {};
        loadedPhotos.forEach((img, idx) => {
          if (slots[idx]) {
            nextSlots[slots[idx]] = img;
          }
        });
        setPhotoSlots(nextSlots);

        setVideo(product.video || null);
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
    if (productType === 'car' || productType === 'bike') {
      setMake(newBrand);
    }
  };

  const handlePhotoUpload = async (e, slotLabel) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const value = await compressImage(file, 1024, 1024, 0.7).catch(() => fileToBase64(file));
      setPhotoSlots((current) => {
        const next = { ...current, [slotLabel]: value };
        setPhotos(Object.values(next).filter(Boolean));
        return next;
      });
    } catch {
      setErrorMsg('Failed to process image files.');
    } finally {
      e.target.value = '';
    }
  };

  const handleDocUpload = async (e, setter) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const value = file.type.startsWith('image/')
        ? await compressImage(file, 1024, 1024, 0.7).catch(() => fileToBase64(file))
        : await fileToBase64(file);
      setter(value);
    } catch {
      setErrorMsg('Failed to process document file.');
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

    try {
      setLoading(true);
      setVideo(await fileToBase64(file));
    } catch {
      setErrorMsg('Failed to process video file.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const buildPayload = () => {
    const specifications = {
      warranty_available: specs.warrantyAvailable
    };
    const documents = {};

    const finalMake = (productType === 'car' || productType === 'bike') ? brand : make;
    if (finalMake.trim()) specifications.make = finalMake.trim();

    if (productType === 'car' || productType === 'bike') {
      Object.assign(specifications, {
        year: Number(specs.year),
        km_driven: Number(specs.kmDriven),
        insurance_status: specs.insuranceStatus.trim(),
        fuel_type: specs.fuelType,
        ownership: specs.ownership,
        accidental: specs.accidental
      });
      documents.rc_copy = rcCopy;
      documents.insurance_copy = insuranceCopy;
    }

    if (productType === 'laptop') {
      Object.assign(specifications, {
        processor: specs.processor.trim(),
        ram: specs.ram.trim(),
        storage: specs.storage.trim()
      });
      documents.aadhaar_card = aadhaarCard;
      documents.pan_card = panCard;
      if (specs.batteryBackup.trim()) specifications.battery_backup = specs.batteryBackup.trim();
      if (specs.graphics.trim()) specifications.graphics = specs.graphics.trim();
      if (specs.batteryHealth.trim()) specifications.battery_health = specs.batteryHealth.trim();
    }

    if (productType === 'mobile') {
      Object.assign(specifications, {
        ram: specs.ram.trim(),
        storage: specs.storage.trim()
      });
      documents.aadhaar_card = aadhaarCard;
      documents.pan_card = panCard;
      if (specs.imeiNumber.trim()) specifications.imei_number = specs.imeiNumber.trim();
    }

    return {
      category: productType.toUpperCase(),
      title: title.trim(),
      brand: brand.trim(),
      model: model.trim(),
      condition,
      description: description.trim(),
      product_price: Number(productPrice),
      expected_price: Number(expectedPrice),
      photos,
      video: video || null,
      specifications,
      documents
    };
  };

  const validateForm = () => {
    if (!title.trim() || !brand.trim() || !model.trim()) return 'Please complete title, brand, and model.';
    if (!productPrice || Number(productPrice) <= 0) return 'Product price must be greater than 0.';
    if (!expectedPrice || Number(expectedPrice) <= 0) return 'Expected price must be greater than 0.';
    if (!video) return 'Video walkthrough is required.';

    // Mandatory Photo Validation
    if (productType === 'car') {
      if (!photoSlots['Front image']) return 'Front image of the car is mandatory.';
      if (!photoSlots['Back image']) return 'Back image of the car is mandatory.';
      if (!photoSlots['Dashboard']) return 'Dashboard image of the car is mandatory.';
      if (!photoSlots['Speedometer']) return 'Speedometer image of the car is mandatory.';
      if (!photoSlots['Engine']) return 'Engine image of the car is mandatory.';
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

    if (productType === 'car' || productType === 'bike') {
      if (!specs.ownership || !specs.accidental) return 'Please select ownership and accidental status.';
      if (!rcCopy || !insuranceCopy) return 'RC Document and Insurance Document are required.';
    }

    if (productType === 'laptop') {
      if (!specs.ram.trim() || !specs.storage.trim()) {
        return 'RAM and Storage are required.';
      }
      if (!aadhaarCard || !panCard) return 'Aadhaar Card and PAN Card are required.';
    }

    if (productType === 'mobile') {
      if (!specs.ram.trim() || !specs.storage.trim()) return 'Storage and RAM are required.';
      if (!aadhaarCard || !panCard) return 'Aadhaar Card and PAN Card are required.';
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
      const loaded = await loadCashfree();
      if (!loaded) {
        toast.error('Unable to load Cashfree Checkout. Please check your internet connection and try again.');
        setLoading(false);
        return;
      }

      const orderRes = await createRelistOrder(listingId);
      const orderId = orderRes.orderId || orderRes.order_id;
      const paymentSessionId = orderRes.paymentSessionId || orderRes.payment_session_id;
      const modeValue = orderRes.cashfree_mode || orderRes.cashfreeMode;
      const cashfreeFactory = window.Cashfree || globalThis.Cashfree;
      if (typeof cashfreeFactory !== 'function' || !paymentSessionId || !orderId) {
        console.error('Cashfree relist order payload missing checkout fields:', orderRes);
        toast.error('Cashfree checkout could not be initialized.');
        setLoading(false);
        return;
      }

      const cashfree = cashfreeFactory({
        mode: modeValue === 'production' ? 'production' : 'sandbox'
      });

      const result = await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_modal'
      });

      if (result?.error) {
        const reason = buildCashfreeFailureReason(result);
        try {
          await markRelistPaymentFailed(listingId, {
            cashfreeOrderId: orderId,
            reason
          });
        } catch (err) {
          console.error('Failed to log payment failure:', err);
        }
        toast.error(reason);
        setLoading(false);
        return;
      }

      let submitted = false;
      let lastSubmitError = null;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          await submitRelistAfterPayment(listingId, {
            ...formData,
            cashfreeOrderId: orderId
          });
          submitted = true;
          break;
        } catch (err) {
          lastSubmitError = err;
          const detail = err.response?.data?.detail || '';
          const retriable = /payment not completed/i.test(detail) || /ACTIVE/i.test(detail);
          if (!retriable || attempt === 4) {
            break;
          }
          await sleep(1500);
        }
      }

      if (!submitted) {
        try {
          await markRelistPaymentFailed(listingId, {
            cashfreeOrderId: orderId,
            reason: lastSubmitError?.response?.data?.detail || 'Payment verification or submit failed'
          });
        } catch (err) {
          console.error('Failed to mark relist payment as failed:', err);
        }
        throw lastSubmitError || new Error('Payment verification or submit failed.');
      }

      toast.success('Payment successful. Listing submitted for admin approval.');
      navigate(`${basePath}/my-listings`);
    } catch (err) {
      console.error('Relisting initialization failed:', err);
      toast.error(err.response?.data?.detail || 'Failed to initialize payment process.');
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '1.5rem 0' }}>
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

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
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

              <Input label="Listing Title *" value={title} onChange={setTitle} placeholder={TITLE_PLACEHOLDERS[productType]} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Select label="Brand *" value={brand} onChange={handleBrandChange} options={brandModelData?.brands || []} placeholder={brandModelData?.brandPlaceholder || ''} />
                <Select label="Model *" value={model} onChange={setModel} options={brandModelData?.modelsByBrand?.[brand] || []} placeholder={brand ? (brandModelData?.modelPlaceholder || '') : 'Select Brand First'} disabled={!brand} />
              </div>
            </section>

            <section className="card">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>{sectionTitle[productType]}</h2>
              {(productType === 'car' || productType === 'bike') && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
                    <Input label="Processor" value={specs.processor} onChange={(v) => updateSpec('processor', v)} placeholder="e.g. Intel i5 / Ryzen 5" />
                    <Input label="RAM *" value={specs.ram} onChange={(v) => updateSpec('ram', v)} placeholder="e.g. 8GB" />
                    <Input label="Storage *" value={specs.storage} onChange={(v) => updateSpec('storage', v)} placeholder="e.g. 512GB SSD" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
                    <Input label="Graphics Card" value={specs.graphics} onChange={(v) => updateSpec('graphics', v)} placeholder="Graphics card" />
                    <Input label="Battery Backup" value={specs.batteryBackup} onChange={(v) => updateSpec('batteryBackup', v)} placeholder="e.g. 3-4 hours" />
                    <Input label="Battery Health" value={specs.batteryHealth} onChange={(v) => updateSpec('batteryHealth', v)} placeholder="Battery health" />
                  </div>
                </>
              )}

              {productType === 'mobile' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
                    <Input label="Storage *" value={specs.storage} onChange={(v) => updateSpec('storage', v)} placeholder="e.g. 128GB" />
                    <Input label="RAM *" value={specs.ram} onChange={(v) => updateSpec('ram', v)} placeholder="e.g. 6GB" />
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
                <Input label="Product Price Rs *" type="number" value={productPrice} onChange={setProductPrice} placeholder="e.g. 500000" />
                <Input label="Expected Price Rs *" type="number" value={expectedPrice} onChange={setExpectedPrice} placeholder="e.g. 450000" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="description">Description</label>
                <textarea id="description" className="form-control" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write product condition, features, reason for selling..." />
              </div>
            </section>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div className="card">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>Product Photos</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' }}>
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

            {(productType === 'car' || productType === 'bike') && (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem' }}>Admin Documents *</h2>
                <UploadRow label="RC Document" file={rcCopy} onUpload={(e) => handleDocUpload(e, setRcCopy)} onRemove={() => setRcCopy(null)} />
                <UploadRow label="Insurance Document" file={insuranceCopy} onUpload={(e) => handleDocUpload(e, setInsuranceCopy)} onRemove={() => setInsuranceCopy(null)} />
              </div>
            )}

            {(productType === 'laptop' || productType === 'mobile') && (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem' }}>KYC Documents *</h2>
                <UploadRow label="Aadhaar Card" file={aadhaarCard} onUpload={(e) => handleDocUpload(e, setAadhaarCard)} onRemove={() => setAadhaarCard(null)} />
                <UploadRow label="PAN Card" file={panCard} onUpload={(e) => handleDocUpload(e, setPanCard)} onRemove={() => setPanCard(null)} />
              </div>
            )}

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

            <div style={{ display: 'flex', alignItems: 'stretch', gap: '0.85rem', flexWrap: 'wrap' }}>
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
                  'Pay & Relist'
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

const TITLE_PLACEHOLDERS = {
  car: 'e.g. Hyundai Creta 2020 – well maintained',
  bike: 'e.g. Yamaha R15 2021 – minor scratches',
  mobile: 'e.g. iPhone 13 128GB – good condition',
  laptop: 'e.g. Dell Inspiron i5 – lightly used'
};

const Input = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}</label>}
    <input type={type} className="form-control" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ borderRadius: '0.55rem' }} />
  </div>
);

const Select = ({ label, value, onChange, options, placeholder, disabled = false }) => (
  <div className="form-group" style={{ marginBottom: 0 }}>
    {label && <label className="form-label">{label}</label>}
    <select
      className="form-control"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
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

const PhotoSlot = ({ label, value, onUpload, onRemove, required }) => (
  <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.85rem', padding: '0.75rem', minHeight: '112px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.65rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
      <Camera size={20} style={{ color: '#4a1a50', flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <span style={{ fontWeight: 850, color: '#111827', fontSize: '0.9rem', lineHeight: 1.25 }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </span>
        {(label === 'Front image' || label === 'Back image') && (
          <p style={{ margin: '0.15rem 0 0', color: '#8B8278', fontSize: '0.72rem', fontWeight: 700, lineHeight: 1.25 }}>
            Note: number plate should be hidden.
          </p>
        )}
      </div>
    </div>
    {value ? (
      <div style={{ height: '72px', borderRadius: '0.65rem', overflow: 'hidden', position: 'relative', border: '1px solid #d1fae5' }}>
        <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

