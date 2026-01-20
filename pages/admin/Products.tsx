import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Product } from '../../types';
import { useToast } from '../../context/ToastContext';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      setProducts(list);
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [showToast]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        setProducts(products.filter(p => p.id !== id));
        showToast('Product deleted successfully', 'success');
      } catch (error) {
        console.error("Error deleting product:", error);
        showToast('Failed to delete product', 'error');
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading products...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Products</h1>
        <Link
          to="/admin/products/new"
          className="btn btn-primary"
          style={{ textDecoration: 'none' }}
        >
          Add Product
        </Link>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', background: '#f9f9f9' }}>
              <th style={{ padding: '1rem' }}>Image</th>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Price</th>
              <th style={{ padding: '1rem' }}>Weight</th>
              <th style={{ padding: '1rem' }}>Featured</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>
                  <img src={p.image} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} />
                </td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{p.name}</td>
                <td style={{ padding: '1rem' }}>{p.category}</td>
                <td style={{ padding: '1rem' }}>₹{p.price}</td>
                <td style={{ padding: '1rem' }}>{p.weight}g</td>
                <td style={{ padding: '1rem' }}>{p.featured ? '⭐ Yes' : 'No'}</td>
                <td style={{ padding: '1rem' }}>
                  <button
                    onClick={() => navigate(`/admin/products/${p.id}`)}
                    style={{ marginRight: '1rem', color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>No products found. Add one to get started!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;