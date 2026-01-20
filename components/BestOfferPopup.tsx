import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface BestOfferPopupProps {
    offer: Product;
    onClose: () => void;
}

const BestOfferPopup: React.FC<BestOfferPopupProps> = ({ offer, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Small delay to make it pop smoothly
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (!offer) return null;

    const discount = offer.mrp && offer.salePrice
        ? Math.round(((offer.mrp - offer.salePrice) / offer.mrp) * 100)
        : 0;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999, // High z-index to be on top of everything
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            pointerEvents: isVisible ? 'auto' : 'none'
        }}>
            <div style={{
                backgroundColor: '#fff',
                padding: '0',
                borderRadius: '16px',
                maxWidth: '800px',
                width: '90%',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'row', // Side by side layout
                overflow: 'hidden',
                maxHeight: '450px'
            }} className="flex-col-mobile">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        zIndex: 10,
                        color: '#333'
                    }}
                >
                    ✕
                </button>

                {/* Image Side */}
                <div style={{ flex: 1, position: 'relative', minHeight: '200px' }}>
                    <img
                        src={offer.image}
                        alt={offer.name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '5px 15px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                        BEST OFFER
                    </div>
                </div>

                {/* Content Side */}
                <div style={{ flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left', background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)' }}>
                    <h3 style={{ textTransform: 'uppercase', color: '#6b7280', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.5rem' }}>Limited Time Deal</h3>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '1rem', color: '#111827' }}>
                        <span style={{ color: '#ef4444' }}>{discount}% OFF</span><br />
                        <span style={{ fontSize: '1.8rem' }}>on {offer.name}</span>
                    </h2>
                    <p style={{ color: '#4b5563', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                        Don't miss out on our best selling snack. Authenticity guaranteed.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>₹{offer.salePrice}</span>
                        {offer.mrp && <span style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: '#9ca3af' }}>₹{offer.mrp}</span>}
                    </div>

                    <Link
                        to={`/product/${offer.id}`}
                        onClick={onClose}
                        className="btn btn-primary"
                        style={{
                            textAlign: 'center',
                            padding: '1rem 2rem',
                            fontSize: '1.1rem',
                            borderRadius: '8px',
                            background: 'var(--primary)',
                            color: 'white',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)'
                        }}
                    >
                        GRAB DEAL NOW
                    </Link>
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) {
            .flex-col-mobile {
                flex-direction: column !important;
                max-height: 90vh !important;
                width: 90% !important;
            }
            .flex-col-mobile > div:first-child { 
                height: 200px !important; 
                flex: none !important;
            }
             .flex-col-mobile > div:last-child { 
                 padding: 2rem !important;
             }
        }
      `}</style>
        </div>
    );
};

export default BestOfferPopup;
