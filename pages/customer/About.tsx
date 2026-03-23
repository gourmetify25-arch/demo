import React from 'react';

const About: React.FC = () => {
  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
      <h1 className="section-title">About Gourmetify</h1>
      <div style={{ lineHeight: '1.8', color: '#4b5563' }}>
        <p style={{ marginBottom: '1.5rem' }}>
          Welcome to Gourmetify, your premier destination for authentic, high-quality Indian snacks and delicacies. 
          Founded with a passion for traditional flavors, we bring the finest collection of spicy namkeens, 
          authentic chips, sweet delicacies, and refreshing beverages right to your doorstep.
        </p>
        <p style={{ marginBottom: '1.5rem' }}>
          At Gourmetify, we believe in the power of authenticity. That's why we source our products directly 
          from renowned vendors across India, ensuring that each bite delivers the genuine taste and 
          quality you deserve.
        </p>
        <div style={{ background: '#f9fafb', padding: '2rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)', marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-dark)' }}>Our Mission</h2>
          <p>
            To bridge the gap between traditional Indian snack-making heritage and modern convenience, 
            making the authentic flavors of India accessible to everyone, everywhere.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
