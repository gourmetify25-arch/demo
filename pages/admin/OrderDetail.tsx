import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order } from '../../types';
import { useToast } from '../../context/ToastContext';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'orders', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
        } else {
          showToast('Order not found', 'error');
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        showToast('Failed to fetch order', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, showToast]);

  const updateStatus = async (newStatus: Order['status']) => {
    if (!order || !id) return;
    try {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, { status: newStatus });
      setOrder({ ...order, status: newStatus });
      showToast(`Order status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error("Error updating status:", error);
      showToast('Failed to update status', 'error');
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateStatus(e.target.value as Order['status']);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Order Details...</div>;

  if (!order) {
    return <div style={{ padding: '2rem' }}>Order not found.</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/admin/orders" style={{ display: 'inline-block', marginBottom: '1rem', color: '#666' }}>&larr; Back to Orders</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Order #{order.id}</h1>
        <div>
          <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>Status:</label>
          <select
            value={order.status}
            onChange={handleStatusChange}
            style={{ padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>Customer Details</h3>
          <p><strong>Name:</strong> {order.customerName}</p>
          <p><strong>Phone:</strong> {order.phone}</p>
          <p><strong>Email:</strong> {order.email || 'N/A'}</p>
          <p><strong>Address:</strong><br />
            {order.address}<br />
            {order.city}, {order.state} - {order.zip}
          </p>
        </div>

        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Subtotal (approx)</span>
            <span>₹{(order.total - order.shippingCost).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Shipping</span>
            <span>₹{order.shippingCost}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '1rem' }}>
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Items</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '1px solid #eee' }}>
        <thead style={{ background: '#f1f1f1' }}>
          <tr>
            <th style={{ padding: '1rem' }}>Product</th>
            <th style={{ padding: '1rem' }}>Price</th>
            <th style={{ padding: '1rem' }}>Quantity</th>
            <th style={{ padding: '1rem' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  {item.name}
                </div>
              </td>
              <td style={{ padding: '1rem' }}>₹{item.price}</td>
              <td style={{ padding: '1rem' }}>{item.quantity}</td>
              <td style={{ padding: '1rem' }}>₹{item.price * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderDetail;