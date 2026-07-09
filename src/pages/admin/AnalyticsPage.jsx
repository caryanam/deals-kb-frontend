import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Landmark, ShieldCheck, RefreshCw, IndianRupee } from 'lucide-react';
import { getAdminAnalytics } from '../../api/adminApi';
import { formatCurrency } from '../../utils/helpers';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const metrics = await getAdminAnalytics();
      setData(metrics);
    } catch (err) {
      console.error('Failed to load platform analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1F1A1D', fontFamily: "'Outfit', sans-serif" }}>Platform Analytics</h1>
          <p style={{ color: '#8B8278', fontSize: '0.9rem' }}>Site activity metrics, listing distributions, and auction volumes</p>
        </div>
        <button 
          onClick={fetchAnalytics} 
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          disabled={loading}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            border: '3px solid #cbd5e1',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            borderLeftColor: '#6B1B71',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: '#8B8278', fontSize: '0.85rem' }}>Loading analytics metrics...</span>
        </div>
      ) : (
        /* Analytics Grid */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Top row stats summary cards */}
          <div className="grid grid-cols-3">
            <div className="card">
              <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Gross Merchandise Volume (GMV)</span>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: '0.25rem 0' }}>
                <IndianRupee size={24} /> {formatCurrency(data?.gmv || 0)}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#8B8278', margin: 0 }}>Aggregate concluded auction sales values</p>
            </div>
            
            <div className="card">
              <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Bidding Activity Volume</span>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#6B1B71', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
                <Landmark size={24} /> {data?.total_bids || 0}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#8B8278', margin: 0 }}>Total individual bids submitted</p>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Concluded Auctions</span>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
                <ShieldCheck size={24} /> {data?.ended_auctions || 0}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#8B8278', margin: 0 }}>Total listings sold upon expiration</p>
            </div>
          </div>

          {/* Charts grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="grid-cols-2">
            
            {/* Category distribution */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #D8CFC1', paddingBottom: '0.75rem' }}>
                <BarChart3 size={18} style={{ color: '#6B1B71' }} /> Products Distribution by Category
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {data?.products_by_type ? (
                  Object.entries(data.products_by_type).map(([key, val]) => {
                    const totalCounts = Object.values(data.products_by_type).reduce((acc, curr) => acc + curr, 0) || 1;
                    const percentage = Math.round((val / totalCounts) * 100);
                    
                    return (
                      <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
                          <span style={{ color: '#8B8278', textTransform: 'capitalize' }}>{key}</span>
                          <span style={{ color: '#1F1A1D' }}>{val} ({percentage}%)</span>
                        </div>
                        <div style={{
                          height: '10px',
                          backgroundColor: '#D8CFC1',
                          borderRadius: '9999px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${percentage}%`,
                            backgroundColor: 
                              key === 'car' ? '#6B1B71' : 
                              key === 'bike' ? '#10b981' : 
                              key === 'laptop' ? '#f59e0b' : '#a855f7',
                            borderRadius: '9999px',
                            transition: 'width 0.8s ease'
                          }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#8B8278', fontSize: '0.85rem' }}>
                    No listing category distributions recorded.
                  </div>
                )}
              </div>
            </div>

            {/* Listing Status distribution */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #D8CFC1', paddingBottom: '0.75rem' }}>
                <BarChart3 size={18} style={{ color: '#10b981' }} /> Listings by Status
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { name: 'Pending Review', count: data?.pending_listings || 0, color: '#f59e0b' },
                  { name: 'Approved', count: data?.approved_listings || 0, color: '#6B1B71' },
                  { name: 'Live Bidding', count: data?.live_auctions || 0, color: '#ef4444' },
                  { name: 'Ended / Concluded', count: data?.ended_auctions || 0, color: '#10b981' }
                ].map((status, idx) => {
                  const total = (data?.pending_listings || 0) + (data?.approved_listings || 0) + (data?.live_auctions || 0) + (data?.ended_auctions || 0) || 1;
                  const pct = Math.round((status.count / total) * 100);
                  
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
                        <span style={{ color: '#8B8278' }}>{status.name}</span>
                        <span style={{ color: '#1F1A1D' }}>{status.count} ({pct}%)</span>
                      </div>
                      <div style={{
                        height: '10px',
                        backgroundColor: '#D8CFC1',
                        borderRadius: '9999px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: status.color,
                          borderRadius: '9999px',
                          transition: 'width 0.8s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsPage;
