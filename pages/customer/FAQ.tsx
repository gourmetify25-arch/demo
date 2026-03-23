import React from 'react';

const FAQ: React.FC = () => {
  const faqs = [
    {
      q: "How long does shipping take?",
      a: "Most orders are processed within 24 hours and delivered within 3-5 business days across India."
    },
    {
      q: "Do you offer international shipping?",
      a: "Currently, we only ship within India. Stay tuned for updates on international availability."
    },
    {
      q: "Are your products fresh?",
      a: "Yes! We source our snacks directly from vendors to ensure maximum freshness and long shelf life."
    },
    {
      q: "What is your return policy?",
      a: "We offer an easy return policy. If you're not satisfied with the quality, you can return or exchange the product within 48 hours of delivery."
    }
  ];

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
      <h1 className="section-title">Frequently Asked Questions</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {faqs.map((faq, index) => (
          <div key={index} style={{ borderBottom: '1px solid #eee', paddingBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>{faq.q}</h3>
            <p style={{ color: '#4b5563', lineHeight: '1.6' }}>{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
