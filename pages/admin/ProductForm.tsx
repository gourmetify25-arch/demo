import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../context/ToastContext';
import { Product, Brand, Keyword } from '../../types';

const ProductForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const isEditMode = !!id;
    const [brands, setBrands] = useState<Brand[]>([]);
    const [availableKeywords, setAvailableKeywords] = useState<Keyword[]>([]);
    const [keywordFilter, setKeywordFilter] = useState('');

    const [formData, setFormData] = useState<Omit<Product, 'id'>>({
        name: '',
        category: 'Chips', // Default
        price: 0,
        weight: 0,
        description: '',
        image: '',
        featured: false,
        mrp: 0,
        salePrice: 0,
        offerStartDate: '',
        offerEndDate: '',
        brand: '',
        images: [],
        keywords: [],
        stock: 0
    });
    const [tagInput, setTagInput] = useState('');

    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState(''); // New status text
    const [fetching, setFetching] = useState(isEditMode);

    // Fetch brands and keywords on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const brandSnap = await getDocs(collection(db, 'brands'));
                setBrands(brandSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Brand)));

                const keywordSnap = await getDocs(collection(db, 'keywords'));
                const kList = keywordSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Keyword));
                setAvailableKeywords(kList.sort((a, b) => a.name.localeCompare(b.name)));
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    // Fetch product data if in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            const fetchProduct = async () => {
                try {
                    setFetching(true);
                    const docSnap = await getDoc(doc(db, 'products', id));
                    if (docSnap.exists()) {
                        const data = docSnap.data() as Product;
                        // Ensure all fields are present to avoid uncontrolled input warnings
                        setFormData({
                            name: data.name || '',
                            category: data.category || 'Chips',
                            price: data.price || 0,
                            weight: data.weight || 0,
                            description: data.description || '',
                            image: data.image || '',
                            featured: data.featured || false,
                            mrp: data.mrp || 0,
                            salePrice: data.salePrice || 0,
                            offerStartDate: data.offerStartDate || '',
                            offerEndDate: data.offerEndDate || '',
                            brand: data.brand || '',
                            images: data.images || [],
                            keywords: data.keywords || [],
                            stock: data.stock || 0
                        });
                    } else {
                        showToast('Product not found', 'error');
                        navigate('/admin/products');
                    }
                } catch (error) {
                    console.error("Error fetching product:", error);
                    showToast('Error loading product', 'error');
                } finally {
                    setFetching(false);
                }
            };
            fetchProduct();
        } else {
            setFetching(false);
        }
    }, [id, isEditMode, navigate, showToast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: Number(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Calculate Discount Percentage
    const discountPercentage = React.useMemo(() => {
        if (formData.mrp && formData.salePrice && formData.mrp > formData.salePrice) {
            return Math.round(((formData.mrp - formData.salePrice) / formData.mrp) * 100);
        }
        return 0;
    }, [formData.mrp, formData.salePrice]);

    // Helper to convert file to compressed Base64
    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 500; // Resize to max 500px to save space
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Compress to JPEG with 0.7 quality
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(compressedBase64);
                };
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setStatusText('Processing image...');
            try {
                const base64 = await convertToBase64(file);
                setFormData(prev => ({ ...prev, image: base64 }));
                setStatusText('');
            } catch (err) {
                console.error("Image processing error", err);
                alert("Could not process image.");
                setStatusText('');
            }
        }
    }


    const handleMultipleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const currentImagesCount = (formData.images || []).length;
            if (currentImagesCount + e.target.files.length > 5) {
                alert("You can upload a maximum of 5 images.");
                return;
            }

            setStatusText('Processing images...');
            const files = Array.from(e.target.files) as File[];
            const newImages: string[] = [];

            try {
                for (const file of files) {
                    const base64 = await convertToBase64(file);
                    newImages.push(base64);
                }
                setFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...newImages]
                }));
                setStatusText('');
            } catch (err) {
                console.error("Multiple image processing error", err);
                alert("Could not process one or more images.");
                setStatusText('');
            }
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = tagInput.trim();
            if (trimmed && !formData.keywords?.includes(trimmed)) {
                setFormData(prev => ({
                    ...prev,
                    keywords: [...(prev.keywords || []), trimmed]
                }));
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            keywords: (prev.keywords || []).filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatusText('Saving product...');

        try {
            if (!formData.image && (!formData.images || formData.images.length === 0)) {
                showToast('Please upload at least one product image.', 'error');
                setLoading(false);
                setStatusText('');
                return;
            }

            if (isEditMode && id) {
                // Update
                await updateDoc(doc(db, 'products', id), formData);
                showToast('Product updated successfully', 'success');
            } else {
                // Create
                await addDoc(collection(db, 'products'), formData);
                showToast('Product created successfully', 'success');
            }
            navigate('/admin/products');
        } catch (error: any) {
            console.error("Error saving product:", error);
            showToast('Failed to save product: ' + error.message, 'error');
        } finally {
            setLoading(false);
            setStatusText('');
        }
    };

    if (fetching) return <div style={{ padding: '2rem' }}>Loading product details...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="Spices">Spices</option>
                            <option value="Beverages">Beverages</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Brand</label>
                    <select
                        name="brand"
                        value={formData.brand || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="">Select Brand (Optional)</option>
                        {brands.map(brand => (
                            <option key={brand.id} value={brand.name}>{brand.name}</option>
                        ))}
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Weight (g)</label>
                        <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            required
                            min="0"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Stock</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock || 0}
                            onChange={handleChange}
                            min="0"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                </div>

                {/* Pricing & Offers Section */}
                <div style={{ border: '1px solid #eee', padding: '1.5rem', borderRadius: '8px', background: '#fafafa' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>Pricing & Offers</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>MRP (₹)</label>
                            <input
                                type="number"
                                name="mrp"
                                value={formData.mrp || ''}
                                onChange={handleChange}
                                min="0"
                                placeholder="100"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Sale Price (₹)</label>
                            <input
                                type="number"
                                name="salePrice"
                                value={formData.salePrice || ''}
                                onChange={handleChange}
                                min="0"
                                placeholder="80"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#e3f2fd', borderRadius: '4px', padding: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#1976d2' }}>Auto Discount</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1565c0' }}>{discountPercentage}% OFF</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Offer Start Date</label>
                            <input
                                type="date"
                                name="offerStartDate"
                                value={formData.offerStartDate || ''}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Offer End Date</label>
                            <input
                                type="date"
                                name="offerEndDate"
                                value={formData.offerEndDate || ''}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                        * If Sale Price and Dates are set, the "Sale Price" will be used as the selling price during the offer period. Outside this period, "Price" (or MRP if standard) applies.
                        <strong> Note: Ensure 'Price' field above matches your intended base selling price.</strong>
                    </p>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Keywords / Hashtags</label>
                    <div style={{ border: '1px solid #ddd', borderRadius: '4px', background: '#fafafa', padding: '1rem' }}>
                        {/* Filter / Custom Input */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                value={keywordFilter}
                                onChange={(e) => setKeywordFilter(e.target.value)}
                                minLength={1} // Prevent empty enter
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const trimmed = keywordFilter.trim().replace(/^#/, '');
                                        if (trimmed && !formData.keywords?.includes(trimmed)) {
                                            setFormData(prev => ({
                                                ...prev,
                                                keywords: [...(prev.keywords || []), trimmed]
                                            }));
                                            setKeywordFilter('');
                                        }
                                    }
                                }}
                                placeholder="Search or add custom tag..."
                                style={{ flex: 1, padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const trimmed = keywordFilter.trim().replace(/^#/, '');
                                    if (trimmed && !formData.keywords?.includes(trimmed)) {
                                        setFormData(prev => ({
                                            ...prev,
                                            keywords: [...(prev.keywords || []), trimmed]
                                        }));
                                        setKeywordFilter('');
                                    }
                                }}
                                style={{ padding: '0 1rem', background: '#e0e0e0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Add
                            </button>
                        </div>


                        {/* Selected Tags */}
                        {formData.keywords && formData.keywords.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                {formData.keywords.map((tag, idx) => (
                                    <span key={idx} style={{ background: '#1976d2', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        #{tag}
                                        <button type="button" onClick={() => removeTag(tag)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#fff', fontWeight: 'bold' }}>&times;</button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Available Keywords Selection */}
                        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Select from available:</p>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            maxHeight: '150px',
                            overflowY: 'auto',
                            padding: '0.5rem',
                            border: '1px solid #eee',
                            background: '#fff'
                        }}>
                            {availableKeywords
                                .filter(k => k.name.toLowerCase().includes(keywordFilter.toLowerCase()))
                                .map(k => {
                                    const isSelected = formData.keywords?.includes(k.name);
                                    return (
                                        <button
                                            key={k.id}
                                            type="button"
                                            onClick={() => {
                                                if (isSelected) removeTag(k.name);
                                                else {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        keywords: [...(prev.keywords || []), k.name]
                                                    }));
                                                }
                                            }}
                                            style={{
                                                border: isSelected ? '1px solid #1976d2' : '1px solid #ddd',
                                                background: isSelected ? '#e3f2fd' : '#fff',
                                                color: isSelected ? '#1565c0' : '#333',
                                                padding: '0.3rem 0.6rem',
                                                borderRadius: '16px',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {k.name}
                                        </button>
                                    );
                                })
                            }
                            {availableKeywords.length === 0 && <span style={{ color: '#999', fontSize: '0.8rem' }}>No preset keywords found.</span>}
                        </div>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Product Image</label>
                    <div style={{ border: '1px dashed #ccc', padding: '1rem', borderRadius: '4px', background: '#fafafa' }}>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ marginBottom: '1rem' }}
                        />
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Or use a URL (optional backup):</div>
                        <input
                            type="text"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            style={{ width: '100%', padding: '0.6rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>

                    {formData.image && (
                        <div style={{ marginTop: '1rem' }}>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Preview:</p>
                            <img
                                src={formData.image}
                                alt="Preview"
                                style={{ height: '150px', borderRadius: '4px', border: '1px solid #ddd', objectFit: 'contain' }}
                            />
                        </div>
                    )}
                </div>

                {/* Multiple Images Upload Section */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Additional Images (Gallery)</label>
                    <div style={{ border: '1px dashed #ccc', padding: '1rem', borderRadius: '4px', background: '#fafafa' }}>
                        <input
                            type="file"
                            multiple
                            onChange={handleMultipleFilesChange}
                            accept="image/*"
                            style={{ marginBottom: '1rem' }}
                        />
                        <p style={{ fontSize: '0.8rem', color: '#666' }}>Select multiple images to create a product gallery.</p>
                    </div>

                    {formData.images && formData.images.length > 0 && (
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {formData.images.map((img, idx) => (
                                <div key={idx} style={{ position: 'relative', width: '100px', height: '100px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                                    <img
                                        src={img}
                                        alt={`Gallery ${idx}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        style={{
                                            position: 'absolute',
                                            top: '0',
                                            right: '0',
                                            background: 'rgba(255,0,0,0.8)',
                                            color: 'white',
                                            border: 'none',
                                            width: '24px',
                                            height: '24px',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            lineHeight: '1'
                                        }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                        id="featured"
                        style={{ width: '18px', height: '18px' }}
                    />
                    <label htmlFor="featured" style={{ cursor: 'pointer' }}>Mark as Featured Product</label>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        style={{ padding: '1rem 2rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ padding: '1rem 2rem', flex: 1 }}
                    >
                        {loading ? (statusText || 'Saving...') : (isEditMode ? 'Update Product' : 'Create Product')}
                    </button>
                </div>
            </form >
        </div >
    );
};

export default ProductForm;
