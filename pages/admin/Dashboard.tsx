import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order, Product } from '../../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<{
    totalProducts: number;
    totalOrders: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    lowStockItems: Product[];
  }>({
    totalProducts: 0,
    totalOrders: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    lowStockItems: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch Products Count
        const productsSnap = await getDocs(collection(db, 'products'));
        const totalProducts = productsSnap.size;

        // Fetch Orders and Calculate Stats
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const orders = ordersSnap.docs.map(doc => doc.data() as Order);

        const totalOrders = orders.length;
        const pending = orders.filter(o => o.status === 'Pending').length;
        const processing = orders.filter(o => o.status === 'Processing').length;
        const shipped = orders.filter(o => o.status === 'Shipped').length;
        const delivered = orders.filter(o => o.status === 'Delivered').length;
        const cancelled = orders.filter(o => o.status === 'Cancelled').length;

        const lowStockItems = (productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)))
          .filter(p => (p.stock === undefined || p.stock < 5));

        setStats({
          totalProducts,
          totalOrders,
          pending,
          processing,
          shipped,
          delivered,
          cancelled,
          lowStockItems
        });

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, color, icon }: { title: string, value: number, color: string, icon: string }) => (
    <div style={{
      background: '#fff',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      borderLeft: `5px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>{title}</p>
        <h2 style={{ fontSize: '2rem', margin: 0, color: '#333' }}>{value}</h2>
      </div>
      <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: color, opacity: 0.2 }}>{icon}</span>
    </div>
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

      {loading ? (
        <div>Loading stats...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <StatCard title="Total Products" value={stats.totalProducts} color="#2563eb" icon="inventory_2" />
            <StatCard title="Total Orders" value={stats.totalOrders} color="#7c3aed" icon="shopping_bag" />
          </div>

          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#444' }}>Order Status</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <StatCard title="Pending" value={stats.pending} color="#f59e0b" icon="pending" />
            <StatCard title="Processing" value={stats.processing} color="#3b82f6" icon="sync" />
            <StatCard title="Shipped" value={stats.shipped} color="#8b5cf6" icon="local_shipping" />
            <StatCard title="Delivered" value={stats.delivered} color="#10b981" icon="check_circle" />
            <StatCard title="Canceled" value={stats.cancelled} color="#ef4444" icon="cancel" />
          </div>

          {stats.lowStockItems.length > 0 && (
            <>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#dc2626' }}>Low Stock Alert (less than 5)</h2>
              <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #fee2e2', overflow: 'hidden', marginBottom: '3rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#fef2f2' }}>
                    <tr>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: '#991b1b' }}>Product Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: '#991b1b' }}>Stock</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: '#991b1b' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lowStockItems.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #fee2e2' }}>
                        <td style={{ padding: '1rem', color: '#333' }}>{p.name}</td>
                        <td style={{ padding: '1rem', fontWeight: 'bold', color: '#dc2626' }}>{p.stock || 0}</td>
                        <td style={{ padding: '1rem' }}>
                          <Link to={`/admin/products/edit/${p.id}`} style={{ color: '#2563eb', fontSize: '0.9rem', textDecoration: 'none' }}>Restock</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#444' }}>Quick Actions</h2>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <Link to="/admin/products" style={{
          padding: '2rem', background: '#fff', border: '1px solid #ddd', borderRadius: '8px',
          width: '200px', textAlign: 'center', textDecoration: 'none', color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#2563eb' }}>inventory_2</span>
          <h3 style={{ margin: '0.5rem 0' }}>Products</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Manage inventory</p>
        </Link>
        <Link to="/admin/orders" style={{
          padding: '2rem', background: '#fff', border: '1px solid #ddd', borderRadius: '8px',
          width: '200px', textAlign: 'center', textDecoration: 'none', color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#7c3aed' }}>orders</span>
          <h3 style={{ margin: '0.5rem 0' }}>Orders</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>View & process orders</p>
        </Link>
        <Link to="/admin/keywords" style={{
          padding: '2rem', background: '#fff', border: '1px solid #ddd', borderRadius: '8px',
          width: '200px', textAlign: 'center', textDecoration: 'none', color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#059669' }}>tag</span>
          <h3 style={{ margin: '0.5rem 0' }}>Keywords</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Manage Tags</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;