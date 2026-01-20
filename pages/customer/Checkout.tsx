import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { collection, doc, writeBatch, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../../firebase';
// ... other imports
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';

// ... inside Checkout component ...
const Checkout: React.FC = () => {
  const { cart, subtotal, totalWeight, chargeableWeight, shippingCost, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    paymentMethod: 'upi'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.email) {
        alert("You must be logged in to place an order.");
        return;
      }

      const orderData: Omit<Order, 'id'> = {
        customerName: formData.name,
        phone: formData.phone,
        email: user.email,
        userId: user.uid,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        date: new Date().toISOString(),
        status: 'Pending',
        total: total,
        items: cart,
        shippingCost: shippingCost,
        trackingId: 'TRK-' + Date.now()
      };

      const batch = writeBatch(db);

      // 1. Create Order
      const newOrderRef = doc(collection(db, 'orders'));
      batch.set(newOrderRef, {
        ...orderData,
        createdAt: serverTimestamp()
      });

      // 2. Decrement Stock for each item
      cart.forEach(item => {
        const productRef = doc(db, 'products', item.id);
        // Only decrement if stock was intended to be tracked? 
        // We simply decrement. If field doesn't exist, it becomes negative (indicating oversold/untracked).
        // Since we want "show low stock", negative or 0 is correct signal.
        batch.update(productRef, { stock: increment(-item.quantity) });
      });

      await batch.commit();

      const finalOrder = { ...orderData, id: newOrderRef.id };


      clearCart();
      navigate('/order-confirmation', { state: { order: finalOrder } });
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to place order: " + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return <div className="container" style={{ padding: '2rem' }}>Your cart is empty.</div>;
  }

  const isMobile = window.innerWidth <= 768;

  return (
    <div className={`container ${isMobile ? 'grid-1-mobile' : ''}`} style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
      gap: '2rem',
      margin: '2rem auto'
    }}>
      {/* Form Section */}
      <div>
        <h2 style={{ marginBottom: '1.5rem' }}>Checkout</h2>
        <form id="checkout-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading && <div style={{ color: 'blue' }}>Processing Order...</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: '500' }}>Full Name <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="name" placeholder="Full Name" required style={{ padding: '0.8rem', width: '100%' }} onChange={handleChange} value={formData.name} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: '500' }}>Phone Number <span style={{ color: 'red' }}>*</span></label>
              <input type="tel" name="phone" placeholder="Phone Number" required style={{ padding: '0.8rem', width: '100%' }} onChange={handleChange} value={formData.phone} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: '500' }}>Address <span style={{ color: 'red' }}>*</span></label>
            <input type="text" name="address" placeholder="Address (House No, Street)" required style={{ padding: '0.8rem', width: '100%' }} onChange={handleChange} value={formData.address} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: '500' }}>City <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="city" placeholder="City" required style={{ padding: '0.8rem', width: '100%' }} onChange={handleChange} value={formData.city} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: '500' }}>State <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="state" placeholder="State" required style={{ padding: '0.8rem', width: '100%' }} onChange={handleChange} value={formData.state} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: '500' }}>PIN Code <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="zip" placeholder="PIN Code" required style={{ padding: '0.8rem', width: '100%' }} onChange={handleChange} value={formData.zip} />
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Payment Method</label>
            <div style={{
              padding: '1rem', border: '1px solid #ddd', borderRadius: '4px',
              background: '#f9f9f9', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>📱</span>
              <span style={{ fontWeight: 'bold' }}>UPI / Online Payment</span>
              <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: 'auto' }}>Default</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
              Cash on Delivery is currently unavailable. Please pay via UPI on the next step / delivery.
            </p>
          </div>
        </form>
      </div>

      {/* Order Summary Sidebar */}
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', border: '1px solid #eee', height: 'fit-content' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Order Summary</h3>

        <div style={{ marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} />
                  <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>{item.quantity}</span>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '500', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>{item.weight}g</div>
                </div>
              </div>
              <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>₹{item.price * item.quantity}</div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
            <span>Shipping</span>
            <span>₹{shippingCost}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--success)' }}>
            <span>GST (Included)</span>
            <span>₹0</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
            <span>Grand Total</span>
            <span>₹{total}</span>
          </div>

          <button
            type="submit"
            form="checkout-form"
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Place Order \u2192'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#999' }}>
            🔒 Your payment information is processed securely.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;