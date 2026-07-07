import React from 'react';

const HowItWorksSection = () => {
  const steps = [
    {
      num: '1',
      title: 'List Assets',
      desc: 'Sellers upload specs, documentation (like RC Copy or Invoice), photos, and a video walkthrough.'
    },
    {
      num: '2',
      title: 'Documentation Review',
      desc: 'Admins verify documents, checking quality and listing metadata. Approved items transition to the pipeline.'
    },
    {
      num: '3',
      title: 'Go Live Timed',
      desc: 'Auctions go live with active bidding rooms. Rapid countdown clocks initialize automatically.'
    },
    {
      num: '4',
      title: 'Bid Real-Time',
      desc: 'Buyers place live incremental bids. Sockets sync values instantly, extending the countdown if bids arrive late.'
    },
    {
      num: '5',
      title: 'Conclude & Chat',
      desc: 'Auction closes. The winner locks the asset, and both parties initialize direct chats to finalize details.'
    }
  ];

  return (
    <section id="how-it-works" className="landing-section" style={{ backgroundColor: '#FAF6EA' }}>
      <div className="landing-container">
        
        {/* Title */}
        <h2 className="landing-section-title">How It Works</h2>
        <p className="landing-section-subtitle">
          DealsKB uses a transparent, verified bidding lifecycle to guarantee the best experience.
        </p>

        {/* Timeline Steps */}
        <div className="landing-how-works-grid">
          {steps.map((step, idx) => (
            <div key={idx} className="landing-how-works-step">
              <div className="landing-how-works-number">{step.num}</div>
              <h3 className="landing-how-works-steptitle">{step.title}</h3>
              <p className="landing-how-works-desc">{step.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;
