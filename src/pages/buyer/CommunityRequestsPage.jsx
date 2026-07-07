import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Check, Trash2, Clock, Info, Heart, X } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  createCommunityRequest,
  getCommunityRequests,
  getMyCommunityRequests,
  joinCommunityRequest,
  leaveCommunityRequest,
  deleteCommunityRequest
} from '../../api/communityRequestsApi';
import { formatCurrency } from '../../utils/helpers';
import { CAR_BRANDS, CAR_BRAND_TO_MODELS, LAPTOP_BRANDS, LAPTOP_BRAND_TO_MODELS } from '../../data/carLaptopData';

export const CommunityRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [myCreated, setMyCreated] = useState([]);
  const [myJoined, setMyJoined] = useState([]);
  
  const [activeTab, setActiveTab] = useState('all'); // all, created, joined
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [productType, setProductType] = useState('car');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [budgetMin, setBudgetMin] = useState(3000);
  const [budgetMax, setBudgetMax] = useState(50000);
  const [conditionPreference, setConditionPreference] = useState('Any');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      if (activeTab === 'all') {
        const params = {
          status: 'active'
        };
        if (categoryFilter !== 'all') {
          params.product_type = categoryFilter;
        }
        if (searchTerm.trim() !== '') {
          params.search = searchTerm.trim();
        }
        const data = await getCommunityRequests(params);
        setRequests(data || []);
      } else {
        const data = await getMyCommunityRequests();
        setMyCreated(data.created || []);
        setMyJoined(data.joined || []);
      }
    } catch (err) {
      console.error('Failed to load community requests:', err);
      toast.error('Unable to fetch community requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab, categoryFilter, searchTerm]);

  const handlePostRequest = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!brand.trim()) {
      toast.error('Brand name is required.');
      return;
    }
    if (!model.trim()) {
      toast.error('Model name is required.');
      return;
    }
    if (Number(budgetMin) < 3000 || Number(budgetMax) < 3000) {
      toast.error('Budget values cannot be less than ₹3,000.');
      return;
    }
    if (Number(budgetMax) < Number(budgetMin)) {
      toast.error('Maximum budget cannot be less than minimum budget.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        product_type: productType,
        brand: brand.trim(),
        model: model.trim(),
        budget_min: Number(budgetMin),
        budget_max: Number(budgetMax),
        condition_preference: conditionPreference,
        description: "" // Removed description field
      };

      await createCommunityRequest(payload);
      toast.success('Community request posted successfully!');
      
      // Reset form & Close modal
      setBrand('');
      setModel('');
      setBudgetMin(3000);
      setBudgetMax(50000);
      setConditionPreference('Any');
      setModalOpen(false);
      
      // Refresh list
      fetchRequests();
    } catch (err) {
      console.error('Post request error:', err);
      toast.error(err.response?.data?.detail || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinRequest = async (requestId) => {
    try {
      const data = await joinCommunityRequest(requestId);
      toast.success(data.message || 'Interest logged successfully.');
      
      const newCount = typeof data.interested_count === 'number' ? data.interested_count : 1;
      
      setRequests(prev => prev.map(r => r.request_id === requestId ? { ...r, is_joined_by_me: true, interested_count: newCount } : r));
      setMyCreated(prev => prev.map(r => r.request_id === requestId ? { ...r, is_joined_by_me: true, interested_count: newCount } : r));
      setMyJoined(prev => prev.map(r => r.request_id === requestId ? { ...r, is_joined_by_me: true, interested_count: newCount } : r));
    } catch (err) {
      console.error('Join demand error:', err);
      toast.error(err.response?.data?.detail || 'Unable to register interest.');
    }
  };

  const handleLeaveRequest = async (requestId) => {
    try {
      const data = await leaveCommunityRequest(requestId);
      toast.success(data.message || 'Interest removed successfully.');
      
      const newCount = typeof data.interested_count === 'number' ? data.interested_count : 0;
      
      setRequests(prev => prev.map(r => r.request_id === requestId ? { ...r, is_joined_by_me: false, interested_count: newCount } : r));
      setMyCreated(prev => prev.map(r => r.request_id === requestId ? { ...r, is_joined_by_me: false, interested_count: newCount } : r));
      setMyJoined(prev => prev.map(r => r.request_id === requestId ? { ...r, is_joined_by_me: false, interested_count: newCount } : r));
    } catch (err) {
      console.error('Leave demand error:', err);
      toast.error(err.response?.data?.detail || 'Unable to revoke interest.');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this community request?")) {
      return;
    }
    try {
      await deleteCommunityRequest(requestId);
      toast.success("Community request deleted successfully.");
      
      setRequests(prev => prev.filter(r => r.request_id !== requestId));
      setMyCreated(prev => prev.filter(r => r.request_id !== requestId));
      setMyJoined(prev => prev.filter(r => r.request_id !== requestId));
    } catch (err) {
      console.error("Delete request error:", err);
      toast.error(err.response?.data?.detail || "Failed to delete request.");
    }
  };

  const getDisplayRequests = () => {
    if (activeTab === 'all') {
      return requests;
    } else if (activeTab === 'created') {
      return myCreated;
    } else {
      return myJoined;
    }
  };

  const formatBudgetLabel = (val) => {
    if (val >= 10000000) return '₹1 Crore';
    if (val >= 100000) {
      const lakhs = (val / 100000).toFixed(2);
      return `₹${parseFloat(lakhs)} Lakhs`;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const displayRequests = getDisplayRequests();

  return (
    <div className="container-fluid" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '1.5rem' }}>
      
      {/* Header banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1F1A1D', margin: 0, fontFamily: "'Outfit', sans-serif" }}>Explore Community</h1>
          <p style={{ color: '#8B8278', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            Post what you're looking for and join requests from other buyers in the DealsKB community.
          </p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
        >
          <Plus size={18} /> Post Request
        </button>
      </div>

      {/* Info notification warning about match rules */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        backgroundColor: '#F5ECDD',
        border: '1px solid #D8CFC1',
        color: '#1e3a8a',
        padding: '1rem',
        borderRadius: '0.75rem',
        marginBottom: '2rem',
        fontSize: '0.875rem',
        lineHeight: 1.4
      }}>
        <Info size={20} style={{ color: '#6B1B71', flexShrink: 0 }} />
        <span>
          <strong>Matching Rule:</strong> You'll be notified automatically when a product with the same category, brand, and model is approved by administrators.
        </span>
      </div>

      {/* Tab Selectors */}
      <div style={{ display: 'flex', borderBottom: '2px solid #D8CFC1', marginBottom: '1.5rem', gap: '1.5rem' }}>
        {[
          { key: 'all', label: 'All Requests' },
          { key: 'created', label: 'My Created' },
          { key: 'joined', label: 'My Joined' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 0.25rem',
              fontWeight: activeTab === tab.key ? 800 : 600,
              color: activeTab === tab.key ? '#6B1B71' : '#8B8278',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === tab.key ? '3px solid #6B1B71' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '0.925rem',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters: Category & Search */}
      {activeTab === 'all' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Categories selectors */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'car', 'bike', 'mobile', 'laptop'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  border: '1px solid',
                  borderColor: categoryFilter === cat ? '#6B1B71' : '#D8CFC1',
                  backgroundColor: categoryFilter === cat ? '#F5ECDD' : '#ffffff',
                  color: categoryFilter === cat ? '#6B1B71' : '#8B8278',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
            <input
              type="text"
              placeholder="Search demand requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 1rem 0.5rem 2.25rem',
                borderRadius: '0.75rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#8B8278' }} />
          </div>
        </div>
      )}

      {/* Cards list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : displayRequests.length === 0 ? (
        <div className="card text-center" style={{ padding: '3.5rem 2rem', borderColor: '#D8CFC1' }}>
          <Users size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4a1a50', margin: '0 0 0.5rem 0' }}>No Demands Found</h3>
          <p style={{ color: '#8B8278', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
            No community requests found matching these filter choices. Be the first to post a new request!
          </p>
          <button 
            onClick={() => setModalOpen(true)}
            className="btn btn-primary"
            style={{ width: 'fit-content', margin: '0 auto', fontWeight: 700 }}
          >
            Post Request
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {displayRequests.map((req) => (
            <div key={req.request_id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100" style={{
                borderRadius: '1rem',
                borderColor: '#D8CFC1',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div className="card-body" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  
                  {/* Category badge & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: '#6B1B71',
                      backgroundColor: '#F5ECDD',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '0.5rem',
                      letterSpacing: '0.05em'
                    }}>
                      {req.product_type}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: req.status === 'active' ? '#10b981' : '#8B8278',
                      textTransform: 'capitalize',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: req.status === 'active' ? '#10b981' : '#8B8278' }} />
                      {req.status}
                    </span>
                  </div>

                  {/* Brand & Model */}
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2d0a32', margin: '0 0 0.5rem 0' }}>
                    {req.brand} {req.model}
                  </h3>

                  {/* Range and Condition */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
                    <div style={{ backgroundColor: '#FAF6EA', padding: '0.35rem 0.65rem', borderRadius: '0.5rem', border: '1px solid #D8CFC1' }}>
                      <span style={{ color: '#8B8278', fontWeight: 600 }}>Budget: </span>
                      <strong style={{ color: '#1F1A1D', display: 'block', marginTop: '0.1rem' }}>{formatCurrency(req.budget_min)} - {formatCurrency(req.budget_max)}</strong>
                    </div>
                    <div style={{ backgroundColor: '#FAF6EA', padding: '0.35rem 0.65rem', borderRadius: '0.5rem', border: '1px solid #D8CFC1' }}>
                      <span style={{ color: '#8B8278', fontWeight: 600 }}>Condition: </span>
                      <strong style={{ color: '#1F1A1D', display: 'block', marginTop: '0.1rem' }}>{req.condition_preference}</strong>
                    </div>
                  </div>

                  {/* Description (Omitted if empty in database) */}
                  {req.description && (
                    <p style={{
                      fontSize: '0.85rem',
                      color: '#8B8278',
                      lineHeight: 1.5,
                      margin: '0 0 1.25rem 0',
                      flexGrow: 1,
                      WebkitLineClamp: 3,
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {req.description}
                    </p>
                  )}

                  {/* Author, date and count footer */}
                  <div style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '0.75rem',
                    marginTop: 'auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: '#8B8278'
                  }}>
                    <div>
                      <span style={{ display: 'block', color: '#8B8278', fontWeight: 600 }}>Requested by {req.created_by_name || 'Anonymous'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                        <Clock size={12} />
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#8B8278', fontWeight: 700 }}>
                      <Users size={14} style={{ color: '#6B1B71' }} />
                      <span>{req.interested_count} interested</span>
                    </div>
                  </div>

                  {/* Bidding/Interest Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    {req.is_created_by_me ? (
                      <button
                        onClick={() => handleDeleteRequest(req.request_id)}
                        className="btn btn-danger"
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          backgroundColor: '#ef4444',
                          borderColor: '#ef4444',
                          color: '#ffffff'
                        }}
                      >
                        <Trash2 size={14} /> Delete Request
                      </button>
                    ) : req.is_joined_by_me ? (
                      <button
                        onClick={() => handleLeaveRequest(req.request_id)}
                        className="btn btn-outline-danger"
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        Not Interested
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinRequest(req.request_id)}
                        className="btn btn-primary"
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          backgroundColor: '#6B1B71',
                          borderColor: '#6B1B71'
                        }}
                      >
                        <Heart size={14} /> I'm Interested
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post demand Request Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1050,
          padding: '1rem'
        }}>
          <div className="card" style={{
            maxWidth: '500px',
            width: '100%',
            borderRadius: '1.25rem',
            borderColor: '#D8CFC1',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            {/* Modal header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem',
              borderBottom: '1px solid #f1f5f9',
              backgroundColor: '#FAF6EA'
            }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2d0a32', margin: 0 }}>Post Community Request</h2>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#8B8278', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal body form */}
            <form onSubmit={handlePostRequest} style={{ padding: '1.25rem' }}>
              
              {/* Category Pill Option Chooser */}
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Category *</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  {[
                    { value: 'car', label: 'CAR' },
                    { value: 'bike', label: 'BIKE' },
                    { value: 'mobile', label: 'MOBILE' },
                    { value: 'laptop', label: 'LAPTOP' }
                  ].map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        setProductType(cat.value);
                        setBrand('');
                        setModel('');
                      }}
                      style={{
                        padding: '0.5rem 1.25rem',
                        borderRadius: '9999px',
                        border: '1px solid',
                        borderColor: productType === cat.value ? '#1F1A1D' : '#D8CFC1',
                        backgroundColor: productType === cat.value ? '#1F1A1D' : '#ffffff',
                        color: productType === cat.value ? '#ffffff' : '#8B8278',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand & Model */}
              <div className="row">
                <div className="col-6 mb-3">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Brand *</label>
                  {productType === 'car' ? (
                    <select
                      className="form-control"
                      value={brand}
                      onChange={(e) => {
                        setBrand(e.target.value);
                        setModel('');
                      }}
                      required
                      style={{ borderRadius: '0.5rem', cursor: 'pointer' }}
                    >
                      <option value="">Select Car Brand</option>
                      {CAR_BRANDS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  ) : productType === 'laptop' ? (
                    <select
                      className="form-control"
                      value={brand}
                      onChange={(e) => {
                        setBrand(e.target.value);
                        setModel('');
                      }}
                      required
                      style={{ borderRadius: '0.5rem', cursor: 'pointer' }}
                    >
                      <option value="">Select Laptop Brand</option>
                      {LAPTOP_BRANDS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Apple"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      required
                      style={{ borderRadius: '0.5rem' }}
                    />
                  )}
                </div>
                <div className="col-6 mb-3">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Model *</label>
                  {productType === 'car' ? (
                    <select
                      className="form-control"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      required
                      disabled={!brand}
                      style={{ borderRadius: '0.5rem', cursor: !brand ? 'not-allowed' : 'pointer' }}
                    >
                      <option value="">{brand ? 'Select Car Model' : 'Select Brand First'}</option>
                      {(CAR_BRAND_TO_MODELS[brand] || []).map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  ) : productType === 'laptop' ? (
                    <select
                      className="form-control"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      required
                      disabled={!brand}
                      style={{ borderRadius: '0.5rem', cursor: !brand ? 'not-allowed' : 'pointer' }}
                    >
                      <option value="">{brand ? 'Select Laptop Model' : 'Select Brand First'}</option>
                      {(LAPTOP_BRAND_TO_MODELS[brand] || []).map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. iPhone 13"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      required
                      style={{ borderRadius: '0.5rem' }}
                    />
                  )}
                </div>
              </div>

              {/* Budget Sliders starting from 3,000 to 1 Crore (10,000,000) */}
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Budget Limits (INR) *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.85rem', backgroundColor: '#FAF6EA', borderRadius: '0.5rem', border: '1px solid #D8CFC1' }}>
                  
                  {/* Min budget slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#8B8278', marginBottom: '0.25rem' }}>
                      <span>Min Budget:</span>
                      <span style={{ color: '#6B1B71' }}>{formatBudgetLabel(budgetMin)}</span>
                    </div>
                    <input
                      type="range"
                      min="3000"
                      max="10000000"
                      step="5000"
                      value={budgetMin}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setBudgetMin(val);
                        if (budgetMax < val) setBudgetMax(val);
                      }}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Max budget slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#8B8278', marginBottom: '0.25rem' }}>
                      <span>Max Budget:</span>
                      <span style={{ color: '#6B1B71' }}>{formatBudgetLabel(budgetMax)}</span>
                    </div>
                    <input
                      type="range"
                      min="3000"
                      max="10000000"
                      step="5000"
                      value={budgetMax}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setBudgetMax(val);
                        if (budgetMin > val) setBudgetMin(val);
                      }}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>

                </div>
              </div>

              {/* Condition Preference Pill Option Chooser */}
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Condition Preference *</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  {['Any', 'New', 'Used', 'Pristine'].map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setConditionPreference(cond)}
                      style={{
                        padding: '0.5rem 1.25rem',
                        borderRadius: '9999px',
                        border: '1px solid',
                        borderColor: conditionPreference === cond ? '#1F1A1D' : '#D8CFC1',
                        backgroundColor: conditionPreference === cond ? '#1F1A1D' : '#ffffff',
                        color: conditionPreference === cond ? '#ffffff' : '#8B8278',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {cond.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ fontWeight: 700, borderRadius: '0.5rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ fontWeight: 700, borderRadius: '0.5rem', backgroundColor: '#6B1B71', borderColor: '#6B1B71' }}
                >
                  {submitting ? 'Submitting...' : 'Post Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommunityRequestsPage;
