import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { collection, doc, writeBatch, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../../firebase';
// ... other imports
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';

// ... inside Checkout component ...
// Add Razorpay type definition
declare global {
  interface Window {
    Razorpay: any;
  }
}

// TODO: Replace with your actual Test Key ID
const RAZORPAY_KEY_ID = "rzp_test_YOUR_KEY_HERE";

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
    paymentMethod: 'online' // Default to online
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createOrder = async (paymentId: string) => {
    try {
      const orderData: Omit<Order, 'id'> = {
        customerName: formData.name,
        phone: formData.phone,
        email: user?.email || '',
        userId: user?.uid,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        date: new Date().toISOString(),
        status: 'Pending',
        total: total,
        items: cart,
        shippingCost: shippingCost,
        trackingId: 'TRK-' + Date.now(),
        paymentId: paymentId,
        paymentMethod: 'Razorpay',
        paymentStatus: 'Paid'
      };

      const batch = writeBatch(db);

      // 1. Create Order
      const newOrderRef = doc(collection(db, 'orders'));
      batch.set(newOrderRef, {
        ...orderData,
        createdAt: serverTimestamp()
      });

      // 2. Decrement Stock
      cart.forEach(item => {
        const productRef = doc(db, 'products', item.id);
        batch.update(productRef, { stock: increment(-item.quantity) });
      });

      await batch.commit();

      const finalOrder = { ...orderData, id: newOrderRef.id };
      clearCart();
      navigate('/order-confirmation', { state: { order: finalOrder } });

    } catch (error) {
      console.error("Error creating order:", error);
      alert("Payment successful but failed to create order. Please contact support. Error: " + (error as any).message);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email) {
      alert("You must be logged in to place an order.");
      return;
    }

    if (RAZORPAY_KEY_ID === "rzp_test_YOUR_KEY_HERE") {
      alert("Developer Alert: Please replace 'rzp_test_YOUR_KEY_HERE' in Checkout.tsx with your actual Razorpay Test Key ID.");
      return;
    }

    setLoading(true);

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: total * 100, // Amount in paise
      currency: "INR",
      name: "Gourmetify",
      description: "Order #" + Date.now(),
      image: "https://your-logo-url.com/logo.png", // Start using a real logo if available
      handler: async function (response: any) {
        // Payment Success
        // alert("Payment Successful: " + response.razorpay_payment_id);
        await createOrder(response.razorpay_payment_id);
        setLoading(false);
      },
      prefill: {
        name: formData.name,
        email: user.email,
        contact: formData.phone
      },
      notes: {
        address: formData.address + ", " + formData.city
      },
      theme: {
        color: "#ea580c" // var(--primary)
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        }
      }
    };

    try {
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        alert("Payment Failed: " + response.error.description);
        setLoading(false);
      });
      rzp1.open();
    } catch (error) {
      console.error("Razorpay Error:", error);
      alert("Failed to initiate payment. Is Razorpay script loaded?");
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
        <form id="checkout-form" onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading && <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Processing Payment... Please wait.</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: '500' }}>Full Name <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="name" placeholder="Full Name" required style={{ padding: '0.8rem', width: '100%', border: '1px solid #ddd', borderRadius: '4px' }} onChange={handleChange} value={formData.name} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: '500' }}>Phone Number <span style={{ color: 'red' }}>*</span></label>
              <input type="tel" name="phone" placeholder="Phone Number" required style={{ padding: '0.8rem', width: '100%', border: '1px solid #ddd', borderRadius: '4px' }} onChange={handleChange} value={formData.phone} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: '500' }}>Address <span style={{ color: 'red' }}>*</span></label>
            <input type="text" name="address" placeholder="Address (House No, Street)" required style={{ padding: '0.8rem', width: '100%', border: '1px solid #ddd', borderRadius: '4px' }} onChange={handleChange} value={formData.address} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: '500' }}>City <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="city" placeholder="City" required style={{ padding: '0.8rem', width: '100%', border: '1px solid #ddd', borderRadius: '4px' }} onChange={handleChange} value={formData.city} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: '500' }}>State <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="state" placeholder="State" required style={{ padding: '0.8rem', width: '100%', border: '1px solid #ddd', borderRadius: '4px' }} onChange={handleChange} value={formData.state} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: '500' }}>PIN Code <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="zip" placeholder="PIN Code" required style={{ padding: '0.8rem', width: '100%', border: '1px solid #ddd', borderRadius: '4px' }} onChange={handleChange} value={formData.zip} />
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Payment Method</label>
            <div style={{
              padding: '1rem', border: '1px solid #ddd', borderRadius: '4px',
              background: '#f9f9f9', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>💳</span>
              <span style={{ fontWeight: 'bold' }}>Pay Online (Razorpay)</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px' }}>
                <span style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' }}>UPI</span>
                <span style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' }}>Cards</span>
                <span style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' }}>NetBanking</span>
              </div>
            </div>
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
            {loading ? 'Processing...' : 'Pay Now \u2192'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#999' }}>
            🔒 Secured by Razorpay
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;