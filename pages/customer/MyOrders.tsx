import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import { Link } from 'react-router-dom';

const MyOrders: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user?.email) {
                setLoading(false);
                return;
            }

            try {
                // Determine query. Note: orderBy with where requires an index in Firestore.
                // If it fails, we fall back to client-side sorting or just filtering.
                // Ideally: query(collection(db, 'orders'), where('email', '==', user.email), orderBy('createdAt', 'desc'))

                // For now, simpler query to avoid index issues immediately
                const q = query(collection(db, 'orders'), where('email', '==', user.email));
                const querySnapshot = await getDocs(q);
                const userOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];

                // Sort client-side
                userOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setOrders(userOrders);
            } catch (error) {
                console.error("Error fetching my orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    if (!user) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <h2>Please log in to view your orders.</h2>
            </div>
        );
    }

    if (loading) {
        return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading your orders...</div>;
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>My Orders</h1>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: '#f9f9f9', borderRadius: '8px' }}>
                    <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1rem' }}>You haven't placed any orders yet.</p>
                    <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {orders.map(order => (
                        <div key={order.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1.5rem', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Order Placed</div>
                                    <div style={{ fontWeight: '500' }}>{new Date(order.date).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Total</div>
                                    <div style={{ fontWeight: '500' }}>₹{order.total}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Order #</div>
                                    <div style={{ fontWeight: '500' }}>{order.id.slice(0, 8)}...</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Status</div>
                                    <span style={{
                                        padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold',
                                        background: order.status === 'Delivered' ? '#d1fae5' : '#fef3c7',
                                        color: order.status === 'Delivered' ? '#065f46' : '#92400e'
                                    }}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {order.items.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} />
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#333' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#666' }}>Qty: {item.quantity} x {item.weight}g</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
