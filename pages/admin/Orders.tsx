import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order } from '../../types';
// import { mockOrders } from '../../mockData';

const Orders: React.FC = () => {
  // const [orders] = useState(mockOrders); // Deprecated mock data state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
        setOrders(list);
      } catch (error) {
        console.error("Error fetching orders:", error);
        // Fallback or retry?
        // If sorting by createdAt fails (requires index), try without sort
        try {
          const querySnapshot = await getDocs(collection(db, 'orders'));
          const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
          setOrders(list);
        } catch (e) { console.error(e) }
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading Orders...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Orders</h1>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', minWidth: '600px' }}>
          <thead>
            <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Order ID</th>
              <th style={{ padding: '1rem' }}>Customer</th>
              <th style={{ padding: '1rem' }}>Date</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Total</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>#{order.id.slice(0, 8)}...</td>
                <td style={{ padding: '1rem' }}>{order.customerName}</td>
                <td style={{ padding: '1rem' }}>{new Date(order.date).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: order.status === 'Delivered' ? '#d4edda' : '#fff3cd',
                    color: order.status === 'Delivered' ? '#155724' : '#856404'
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>₹{order.total}</td>
                <td style={{ padding: '1rem' }}>
                  <Link to={`/admin/orders/${order.id}`} style={{ color: 'blue', textDecoration: 'underline' }}>View</Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '1rem', textAlign: 'center' }}>No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;