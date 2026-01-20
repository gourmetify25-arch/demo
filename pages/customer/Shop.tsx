import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Product, Brand } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const FilterSection = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: '1px solid #eee', marginBottom: '1.2rem', paddingBottom: '0.5rem' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '0.8rem',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#444', margin: 0, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{title}</h4>
        <span style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease',
          fontSize: '0.75rem',
          color: '#888'
        }}>
          ▼
        </span>
      </div>

      <div style={{
        maxHeight: isOpen ? '500px' : '0',
        opacity: isOpen ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out'
      }}>
        {children}
      </div>
    </div>
  );
};

const Shop: React.FC = () => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [minDiscount, setMinDiscount] = useState(0);
  const [comboOnly, setComboOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortOption, setSortOption] = useState('Recommended');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        setProducts(list);
        setFilteredProducts(list);

        // Fetch Brands for Filter
        const brandsSnap = await getDocs(collection(db, 'brands'));
        const brandsList = brandsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Brand));
        setBrands(brandsList);

      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Sync URL search param with searchTerm state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search') || '';
    if (searchParam !== searchTerm) {
      setSearchTerm(searchParam);
    }
  }, [location.search]);

  useEffect(() => {
    let result = [...products]; // Create a copy to sort/filter

    // Text Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase().replace(/^#/, '');
      result = result.filter(p =>
        p.name.toLowerCase().includes(lowerTerm) ||
        p.category.toLowerCase().includes(lowerTerm) ||
        p.keywords?.some(k => k.toLowerCase().includes(lowerTerm))
      );
    }

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Brand Filter
    if (selectedBrand !== 'All') {
      result = result.filter(p => p.brand === selectedBrand);
    }

    // Price Filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Discount Filter
    if (minDiscount > 0) {
      result = result.filter(p => {
        if (!p.mrp || !p.salePrice) return false;
        const discount = ((p.mrp - p.salePrice) / p.mrp) * 100;
        return discount >= minDiscount;
      });
    }

    // Rating Filter
    if (minRating > 0) {
      result = result.filter(p => (p.rating || 0) >= minRating);
    }

    // Combo Filter
    if (comboOnly) {
      result = result.filter(p => p.isCombo === true);
    }

    // Sorting Logic
    if (sortOption === 'Price: Low to High') {
      result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortOption === 'Price: High to Low') {
      result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sortOption === 'Top Rated') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    // 'Recommended' leaves it as default (insertion order or however fetched)

    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, selectedBrand, priceRange, minDiscount, minRating, comboOnly, products, sortOption]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  }

  // Derived Lists
  const allCategories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  // Use fetched brands for the filter list
  const allBrands = ['All', ...brands.map(b => b.name)];

  const handleAddToCart = (product: any) => {
    addToCart({ ...product, quantity: 1 });
    showToast(`${product.name} added to cart!`, 'success');
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading products...</div>;
  }

  return (
    <div className="container shop-container" style={{ margin: '2rem auto', display: 'flex', gap: '2rem' }}>

      <div className="flex-col-mobile" style={{ display: 'flex', gap: '2rem', flexDirection: 'row', alignItems: 'flex-start', width: '100%' }}>

        {/* Left Column (Breadcrumbs + Sidebar) */}
        <div className="shop-sidebar-wrapper">
          {/* Breadcrumbs (Desktop Location) */}
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }} className="hidden-mobile">
            Home / Snacks / <span style={{ color: '#111827', fontWeight: 'bold' }}>All Products</span>
          </div>

          {/* Unified Sidebar */}
          <aside
            className={`shop-sidebar ${showMobileFilters ? 'show' : ''}`}
            style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              height: 'fit-content',
              position: 'sticky',
              top: '20px',
              zIndex: 100,
              width: '100%',
              // boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            {/* Mobile Close Button */}
            <div className="visible-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', textTransform: 'uppercase' }}>Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#666' }}
              >✕</button>
            </div>

            {/* Desktop Header area */}
            <div className="hidden-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111', margin: 0 }}>Filters</h3>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedBrand('All');
                  setPriceRange([0, 2000]);
                  setMinDiscount(0);
                  setMinRating(0);
                  setComboOnly(false);
                  setSortOption('Recommended');
                }}
                style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}
              >
                Clear All
              </button>
            </div>

            {/* Filter Sections */}

            <FilterSection title="Categories" defaultOpen={true}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '0.2rem 0' }}>
                {allCategories.map(cat => (
                  <label key={cat} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', color: '#555' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        style={{ marginRight: '0.8rem', accentColor: 'var(--primary)', width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>
                    {cat}
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Price" defaultOpen={true}>
              <div style={{ padding: '0.5rem 0' }}>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  style={{ marginBottom: '1rem', width: '100%', accentColor: 'var(--primary)', height: '4px', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#666', fontSize: '0.9rem', fontWeight: '500' }}>
                  <span>₹0</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>
            </FilterSection>

            <FilterSection title="Discount" defaultOpen={false}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '0.2rem 0' }}>
                {[10, 20, 30, 40, 50].map(disc => (
                  <label key={disc} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', color: '#555' }}>
                    <input
                      type="radio"
                      name="discount"
                      checked={minDiscount === disc}
                      onChange={() => setMinDiscount(prev => prev === disc ? 0 : disc)} // Toggle
                      style={{ marginRight: '0.8rem', accentColor: 'var(--primary)', width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    {disc}% or more
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Rating" defaultOpen={false}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '0.2rem 0' }}>
                {[4, 3, 2, 1].map(stars => (
                  <label key={stars} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', color: '#555' }}>
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === stars}
                      onChange={() => setMinRating(prev => prev === stars ? 0 : stars)}
                      style={{ marginRight: '0.8rem', accentColor: 'var(--primary)', width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {stars}<span style={{ color: '#fbbf24', fontSize: '1rem' }}>★</span> & above
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Pack Type" defaultOpen={false}>
              <div style={{ padding: '0.2rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', color: '#555' }}>
                  <input
                    type="checkbox"
                    checked={comboOnly}
                    onChange={(e) => setComboOnly(e.target.checked)}
                    style={{ marginRight: '0.8rem', width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  Combo Packs Only
                </label>
              </div>
            </FilterSection>

            {allBrands.length > 1 && (
              <FilterSection title="Brand" defaultOpen={false}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem', padding: '0.2rem 0' }}>
                  {allBrands.map(brand => (
                    <label key={brand} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', color: '#555' }}>
                      <input
                        type="radio"
                        name="brand"
                        checked={selectedBrand === brand}
                        onChange={() => setSelectedBrand(brand!)}
                        style={{ marginRight: '0.8rem', accentColor: 'var(--primary)', width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </FilterSection>
            )}

            {/* Mobile Apply Button */}
            <div className="visible-mobile" style={{ marginTop: '2rem' }}>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', fontWeight: '600' }}
              >
                Apply Filters
              </button>
            </div>
          </aside>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }} className="flex-col-mobile">
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111' }}>
                {selectedCategory === 'All' ? 'All Products' : selectedCategory}
              </h1>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>
                {filteredProducts.length} results found
              </p>
            </div>

            {/* Desktop Sort */}
            <div className="hidden-mobile">
              <select
                value={sortOption}
                onChange={handleSortChange}
                style={{ padding: '0.6rem 1rem', borderColor: '#e5e7eb', borderRadius: '6px', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          <style>{`
            /* Mobile/Tablet Portrait (Default) - 2 columns for better density */
            .products-grid-container {
               display: grid;
               grid-template-columns: repeat(2, 1fr);
               gap: 1rem;
            }

            /* Tablet Landscape / Small Desktop (768px - 1024px) */
            @media (min-width: 768px) {
               .products-grid-container {
                  grid-template-columns: repeat(3, 1fr) !important;
                  gap: 1.5rem;
               }
            }

            /* Large Screens (1024px+) - Force 4 columns */
            @media (min-width: 1024px) {
               .shop-sidebar-wrapper {
                  flex: 0 0 280px !important; /* Fixed width sidebar */
                  width: 280px !important;
                  max-width: 280px !important;
               }
               .products-grid-container {
                  grid-template-columns: repeat(4, 1fr) !important;
                  gap: 2rem !important; /* Increase gap slightly for bigger screens */
               }
            }

            /* Extra Large Screens (1600px+) - Scale nicely */
            @media (min-width: 1600px) {
               .products-grid-container {
                  grid-template-columns: repeat(4, 1fr) !important;
                  gap: 2.5rem !important;
               }
            }
          `}</style>

          {/* Mobile Filter Toggle */}
          <div className="visible-mobile" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setShowMobileFilters(true)}
              style={{ flex: 1, padding: '0.8rem', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', fontWeight: 'bold' }}
            >
              Filters
            </button>
            <select
              value={sortOption}
              onChange={handleSortChange}
              style={{ flex: 1, padding: '0.8rem', borderColor: '#ddd', borderRadius: '6px' }}
            >
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          {/* Products Grid */}
          <div className="products-grid-container">
            {filteredProducts.map((product) => (
              <div key={product.id} className="card product-card" style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: '1px solid #eee',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                background: '#fff',
                overflow: 'hidden'
              }}>
                {/* Badges */}
                {product.mrp && product.salePrice && ((product.mrp - product.salePrice) / product.mrp > 0.1) && (
                  <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--danger)', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '0.3rem 0.6rem', borderRadius: '20px', zIndex: 5 }}>
                    {Math.round(((product.mrp - product.salePrice) / product.mrp) * 100)}% OFF
                  </span>
                )}

                {/* Modified: Image Container with Aspect Ratio */}
                <div style={{ position: 'relative', paddingTop: '100%', background: '#fff' }}> {/* Square Aspect Ratio */}
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: '0.2rem'
                    }}
                  />
                </div>

                <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1, borderTop: '1px solid #f5f5f5' }}>
                  <div style={{ fontSize: '0.8rem', color: '#999', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: '600' }}>
                    {product.category}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333', lineHeight: '1.4' }}>
                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{product.name}</Link>
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#111' }}>₹{product.salePrice || product.price}</span>
                    {product.mrp && product.mrp > (product.salePrice || product.price) && (
                      <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem' }}>₹{product.mrp}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn btn-primary"
                    disabled={(product.stock || 0) <= 0}
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      fontSize: '0.95rem',
                      borderRadius: '8px',
                      fontWeight: '600',
                      background: (product.stock || 0) <= 0 ? '#9ca3af' : 'var(--primary)',
                      border: 'none',
                      cursor: (product.stock || 0) <= 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {(product.stock || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;