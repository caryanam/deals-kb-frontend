import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, X, Lock, ExternalLink, ImageOff } from 'lucide-react';
import api from '../../api/axiosClient';
import { formatCurrency, safeParseJSON } from '../../utils/helpers';

const PURPLE = '#6B1B71';
const GOLD = '#B2772D';
const BORDER = '#D8CFC1';

const categories = [
  {
    type: 'car',
    title: 'Cars',
    desc: 'Browse premium sedans, SUVs, and luxury hatchbacks in live bidding rooms.',
    img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80',
    fallbackItems: [
      { id: 'c1', title: '2022 Honda City ZX i-VTEC', price: 850000, brand: 'Honda', model: 'City', img: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400' },
      { id: 'c2', title: '2021 Hyundai Creta SX (O)', price: 1120000, brand: 'Hyundai', model: 'Creta', img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400' },
      { id: 'c3', title: '2023 Maruti Suzuki Swift ZXi+', price: 680000, brand: 'Maruti', model: 'Swift', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400' },
      { id: 'c4', title: '2020 Mahindra Thar LX Hard Top', price: 1250000, brand: 'Mahindra', model: 'Thar', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400' },
    ]
  },
  {
    type: 'bike',
    title: 'Bikes',
    desc: 'Find sports bikes, cruisers, and commuter motorbikes at unbeatable rates.',
    img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=80',
    fallbackItems: [
      { id: 'b1', title: '2023 Royal Enfield Classic 350', price: 175000, brand: 'Royal Enfield', model: 'Classic 350', img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400' },
      { id: 'b2', title: '2022 Yamaha YZF R15 V4', price: 142000, brand: 'Yamaha', model: 'R15 V4', img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400' },
      { id: 'b3', title: '2021 KTM Duke 390', price: 215000, brand: 'KTM', model: 'Duke 390', img: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=400' },
      { id: 'b4', title: '2023 TVS Apache RTR 200 4V', price: 118000, brand: 'TVS', model: 'Apache 200', img: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=400' },
    ]
  },
  {
    type: 'mobile',
    title: 'Mobiles',
    desc: 'Upgrade your phone with top-tier smartphones, iPhones, and Android flagships.',
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
    fallbackItems: [
      { id: 'm1', title: 'Apple iPhone 14 Pro Max 256GB', price: 78000, brand: 'Apple', model: 'iPhone 14 Pro Max', img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400' },
      { id: 'm2', title: 'Samsung Galaxy S23 Ultra 5G', price: 72000, brand: 'Samsung', model: 'S23 Ultra', img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400' },
      { id: 'm3', title: 'OnePlus 11 5G 16GB RAM', price: 44000, brand: 'OnePlus', model: '11 5G', img: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=400' },
      { id: 'm4', title: 'Google Pixel 7 Pro 128GB', price: 41000, brand: 'Google', model: 'Pixel 7 Pro', img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400' },
    ]
  },
  {
    type: 'laptop',
    title: 'Laptops',
    desc: 'Boost your productivity with verified laptops, MacBooks, and gaming rigs.',
    img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80',
    fallbackItems: [
      { id: 'l1', title: 'Apple MacBook Pro M2 16"', price: 125000, brand: 'Apple', model: 'MacBook Pro M2', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400' },
      { id: 'l2', title: 'ASUS ROG Zephyrus G14 Gaming', price: 89000, brand: 'ASUS', model: 'ROG G14', img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400' },
      { id: 'l3', title: 'Dell XPS 15 9520 i7 12th Gen', price: 98000, brand: 'Dell', model: 'XPS 15', img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400' },
      { id: 'l4', title: 'Lenovo ThinkPad X1 Carbon Gen 10', price: 79000, brand: 'Lenovo', model: 'ThinkPad X1', img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400' },
    ]
  }
];

const CategorySection = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const openCategoryModal = async (cat) => {
    setSelectedCategory(cat);
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { product_type: cat.type } });
      const items = res.data?.products || res.data || [];
      if (Array.isArray(items) && items.length > 0) {
        setCategoryProducts(items.slice(0, 4));
      } else {
        setCategoryProducts([]);
      }
    } catch (err) {
      console.warn('Failed to fetch category items:', err);
      setCategoryProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequireLogin = () => {
    navigate('/login');
  };

  return (
    <section id="marketplace" className="landing-section" style={{ backgroundColor: '#FAF6EA', position: 'relative' }}>
      <div className="landing-container">
        
        {/* Title */}
        <h2 className="landing-section-title">Shop by Category</h2>
        <p className="landing-section-subtitle">
          Find your next vehicle or tech gadget in our curated categories. Every listing is thoroughly verified.
        </p>

        {/* Categories Grid */}
        <div className="landing-category-grid">
          {categories.map((cat, idx) => (
            <div 
              key={idx} 
              onClick={() => openCategoryModal(cat)}
              className="landing-category-card"
              style={{ cursor: 'pointer' }}
            >
              <div className="landing-category-img-container">
                <img src={cat.img} alt={cat.title} />
              </div>
              <div className="landing-category-info">
                <h3 className="landing-category-title">{cat.title}</h3>
                <p className="landing-category-desc">{cat.desc}</p>
                <span className="landing-category-link">
                  View Registered Products <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ── Category Products Modal ─────────────────────────────── */}
      {selectedCategory && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(31, 26, 29, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setSelectedCategory(null)}
        >
          <div
            style={{
              backgroundColor: '#FAF6EA',
              borderRadius: '1.25rem',
              maxWidth: '840px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              border: `1px solid ${BORDER}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(31, 26, 29, 0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1F1A1D',
              }}
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: PURPLE, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Marketplace Preview
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1F1A1D', margin: '0.25rem 0' }}>
                Featured {selectedCategory.title} Listings
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#8B8278', margin: 0 }}>
                Explore live &amp; verified {selectedCategory.title.toLowerCase()} registered on DealsKB. Sign in to place bids.
              </p>
            </div>

            {/* Product Cards Grid (3-4 items) */}
            {categoryProducts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                border: `1.5px dashed ${BORDER}`,
                borderRadius: '1rem',
                backgroundColor: '#ffffff',
                marginBottom: '2rem',
                color: '#8B8278'
              }}>
                <ImageOff size={40} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#4a1a50', margin: '0 0 0.25rem 0' }}>No registered products found</h4>
                <p style={{ fontSize: '0.85rem', color: '#8B8278', margin: 0 }}>There are currently no approved products in this category.</p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '2rem',
                }}
              >
                {categoryProducts.map((item, i) => {
                  const photosArray = safeParseJSON(item.photos, []);
                  const itemImg = item.img || (photosArray.length > 0 ? photosArray[0] : null);
                  return (
                    <div
                      key={item.id || item.product_id || i}
                      onClick={handleRequireLogin}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '0.85rem',
                        border: `1px solid ${BORDER}`,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(107, 27, 113, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ height: '130px', overflow: 'hidden', position: 'relative', backgroundColor: '#f1f5f9' }}>
                        {itemImg ? (
                          <img src={itemImg} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            color: '#64748b',
                            backgroundColor: '#f8fafc'
                          }}>
                            <ImageOff size={22} />
                            <span style={{ fontSize: '0.68rem', fontWeight: 700 }}>No image uploaded</span>
                          </div>
                        )}
                        <div
                          style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            backgroundColor: 'rgba(31, 26, 29, 0.75)',
                            backdropFilter: 'blur(4px)',
                            color: '#fff',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '0.35rem',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <Lock size={10} /> Sign in to Bid
                        </div>
                      </div>

                      <div style={{ padding: '0.85rem' }}>
                        <span style={{ fontSize: '0.7rem', color: GOLD, fontWeight: 700 }}>
                          {item.brand || selectedCategory.title}
                        </span>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1F1A1D', margin: '0.2rem 0 0.5rem 0', lineHeight: 1.3 }}>
                          {item.title}
                        </h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.65rem', color: '#8B8278', display: 'block' }}>Starting Price</span>
                            <strong style={{ fontSize: '0.95rem', color: PURPLE, fontWeight: 800 }}>
                              {formatCurrency(item.starting_price || item.price || 0)}
                            </strong>
                          </div>
                          <ExternalLink size={14} style={{ color: PURPLE }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Button: Explore More from Marketplace → Login */}
            <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: `1px solid ${BORDER}` }}>
              <button
                onClick={handleRequireLogin}
                style={{
                  backgroundColor: PURPLE,
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.85rem 2rem',
                  borderRadius: '0.65rem',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(107, 27, 113, 0.3)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7A2181')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PURPLE)}
              >
                <span>Explore More from Marketplace</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CategorySection;
