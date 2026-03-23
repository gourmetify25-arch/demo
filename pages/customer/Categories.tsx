import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const Categories: React.FC = () => {
    const [categories, setCategories] = useState<{ id: string, name: string, image: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Fetch Categories from collection
                const querySnapshot = await getDocs(collection(db, 'categories'));
                const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
                
                // Fetch Products to derive valid names if needed
                const productsSnap = await getDocs(collection(db, 'products'));
                const productsList = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
                
                const isInvalid = (str: string) => !str || str.trim().length === 0 || str.includes('ㅤ');

                // Pre-process categories from collection to handle invalid names
                const categoriesFromDB = list.map(doc => {
                    const cleanName = isInvalid(doc.name) ? doc.id : doc.name;
                    return {
                        id: doc.id,
                        name: cleanName as string,
                        image: doc.image as string
                    };
                });
                
                const productCategories = [...new Set(productsList.map(p => p.category).filter(c => !isInvalid(c)))] as string[];

                const finalCategories = productCategories.map(catName => {
                    // Match by name or ID (case-insensitive)
                    const matched = categoriesFromDB.find(c => 
                        c.name.toLowerCase() === catName.toLowerCase() || 
                        c.id.toLowerCase() === catName.toLowerCase()
                    );
                    
                    return {
                        id: matched?.id || catName,
                        name: catName,
                        image: matched?.image || 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=200&auto=format&fit=crop'
                    };
                });

                // Add any other valid categories from the collection that aren't already included
                categoriesFromDB.forEach(c => {
                    if (!productCategories.some(pc => pc.toLowerCase() === c.name.toLowerCase())) {
                        finalCategories.push(c);
                    }
                });

                setCategories(finalCategories);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) return <div className="container" style={{ padding: '4rem' }}>Loading categories...</div>;

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <h1 className="section-title">All Categories</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
                {categories.map((cat) => (
                    <Link to={`/shop?category=${cat.name}`} key={cat.id} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ height: '200px', overflow: 'hidden' }}>
                            <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} 
                                 onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                 onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} />
                        </div>
                        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{cat.name}</h3>
                            <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600' }}>Explore &rarr;</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Categories;
