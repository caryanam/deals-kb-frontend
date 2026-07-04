import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const CategorySection = () => {
  const navigate = useNavigate();

  const categories = [
    {
      type: 'car',
      title: 'Cars',
      desc: 'Browse premium sedans, SUVs, and luxury hatchbacks in live bidding rooms.',
      img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80'
    },
    {
      type: 'bike',
      title: 'Bikes',
      desc: 'Find sports bikes, cruisers, and commuter motorbikes at unbeatable rates.',
      img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=80'
    },
    {
      type: 'mobile',
      title: 'Mobiles',
      desc: 'Upgrade your phone with top-tier smartphones, iPhones, and Android flagships.',
      img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80'
    },
    {
      type: 'laptop',
      title: 'Laptops',
      desc: 'Boost your productivity with verified laptops, MacBooks, and gaming rigs.',
      img: 'https://images.unsplash.com/photo-1496181130204-7552cc1524e2?w=500&auto=format&fit=crop&q=80'
    }
  ];

  const handleCategoryClick = (type) => {
    navigate(`/buyer/marketplace?product_type=${type}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="category-section" className="landing-section" style={{ backgroundColor: '#ffffff' }}>
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
              onClick={() => handleCategoryClick(cat.type)}
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
                  View All <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategorySection;
