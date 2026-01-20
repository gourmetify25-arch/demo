import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const OrderConfirmation: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;

  useEffect(() => {
    if (!order) {
      navigate('/shop');
    }
  }, [order, navigate]);

  if (!order) return null;

  // Formatting date
  const estimatedDateStart = new Date();
  estimatedDateStart.setDate(estimatedDateStart.getDate() + 3);
  const estimatedDateEnd = new Date();
  estimatedDateEnd.setDate(estimatedDateEnd.getDate() + 5);

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ background: '#F3F4F6', minHeight: '90vh', padding: '2rem 1rem' }}>
      <div className="container" style={{ maxWidth: '800px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>

        {/* Header Section */}
        <div style={{ padding: '2.5rem', textAlign: 'center', background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{
            background: '#D1FAE5', color: '#059669', width: '64px', height: '64px',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 1.5rem auto'
          }}>
            ✓
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>Order Placed Successfully!</h1>
          <p style={{ color: '#6B7280', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
            Thank you for your order, {order.customerName?.split(' ')[0]}! We've received your request and will pack your snacks with care.
          </p>
        </div>

        {/* Order Details Bar */}
        <div className="flex-col-mobile" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 2rem', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Number</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#3B82F6' }}>{order.id}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Delivery</div>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111827' }}>{formatDate(estimatedDateStart)} - {formatDate(estimatedDateEnd)}</div>
          </div>
        </div>

        {/* Two Column details */}
        <div className="flex-col-mobile" style={{ display: 'flex', padding: '2rem' }}>

          {/* Left: Addresses and Payment */}
          <div style={{ flex: 1, paddingRight: '2rem', borderRight: '1px solid #E5E7EB' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem', color: '#374151', fontWeight: '700' }}>
                <span>🚚</span> Shipping Address
              </div>
              <div style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', color: '#111827' }}>{order.customerName}</div>
                <div>{order.address}</div>
                <div>{order.city}, {order.zip}</div>
                <div>{order.state}, India</div>
                <div style={{ marginTop: '0.5rem' }}>Phone: {order.phone}</div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem', color: '#374151', fontWeight: '700' }}>
                <span>💳</span> Payment Method
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '26px', background: '#8B5CF6', borderRadius: '4px' }}></div>
                <span style={{ fontSize: '0.9rem', color: '#4B5563' }}>COD / UPI on Delivery</span>
              </div>
            </div>
          </div>

          {/* Right: Items and Costs */}
          <div style={{ flex: 1.5, paddingLeft: '2rem' }}>
            {/* List Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem' }}>
              <span>Item</span>
              <span>Price</span>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {order.items?.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '6px', border: '1px solid #E5E7EB', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111827' }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Qty: {item.quantity} × {item.weight}g</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: '600', color: '#374151' }}>₹{item.price * item.quantity}</div>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#6B7280' }}>
                <span>Subtotal</span>
                <span>₹{(order.total - order.shippingCost).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#10B981', fontWeight: '500' }}>
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', color: '#6B7280' }}>
                <span>Tax (GST)</span>
                <span>Included</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', color: '#2563EB', paddingTop: '1rem', borderTop: '1px dashed #E5E7EB' }}>
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ background: '#F9FAFB', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E7EB' }} className="flex-col-mobile">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="hidden-mobile">
            <div style={{ width: '40px', height: '40px', background: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>🎧</div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#111827' }}>Need help?</div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Contact support regarding this order.</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => alert(`Your Tracking ID is: ${order.trackingId}\n\nLive tracking feature coming soon!`)}
              style={{ padding: '0.75rem 1.5rem', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '6px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
              Track Order
            </button>
            <button
              onClick={() => navigate('/shop')}
              style={{ padding: '0.75rem 1.5rem', background: 'var(--primary)', border: 'none', borderRadius: '6px', fontWeight: '600', color: '#fff', cursor: 'pointer' }}
            >
              Continue Shopping 🛍️
            </button>
          </div>
        </div>

      </div>

      {/* Footer copyright */}
      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#9CA3AF', fontSize: '0.8rem' }}>
        &copy; 2026 SnackStore India Pvt Ltd. All rights reserved.
      </div>
    </div>
  );
};

export default OrderConfirmation;