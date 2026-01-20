import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../context/ToastContext';
import { Brand } from '../../types';

const BrandForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const isEditMode = !!id;

    const [formData, setFormData] = useState<Omit<Brand, 'id'>>({
        name: '',
        logo: '',
        description: '',
        other: ''
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);
    const [statusText, setStatusText] = useState('');

    useEffect(() => {
        if (isEditMode && id) {
            const fetchBrand = async () => {
                try {
                    const docRef = doc(db, 'brands', id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setFormData(docSnap.data() as Omit<Brand, 'id'>);
                    } else {
                        showToast('Brand not found', 'error');
                        navigate('/admin/brands');
                    }
                } catch (error) {
                    console.error("Error fetching brand:", error);
                    showToast('Error fetching brand details', 'error');
                } finally {
                    setFetching(false);
                }
            };
            fetchBrand();
        }
    }, [id, isEditMode, navigate, showToast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 300; // Smaller size for logos
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/png'));
                };
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setStatusText('Processing logo...');
            try {
                const base64 = await convertToBase64(e.target.files[0]);
                setFormData(prev => ({ ...prev, logo: base64 }));
            } catch (error) {
                console.error("Error processing image", error);
                showToast("Failed to process image", 'error');
            } finally {
                setStatusText('');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatusText('Saving brand...');

        try {
            if (isEditMode && id) {
                await updateDoc(doc(db, 'brands', id), formData);
                showToast('Brand updated successfully', 'success');
            } else {
                await addDoc(collection(db, 'brands'), formData);
                showToast('Brand created successfully', 'success');
            }
            navigate('/admin/brands');
        } catch (error: any) {
            console.error("Error saving brand:", error);
            showToast('Failed to save brand: ' + error.message, 'error');
        } finally {
            setLoading(false);
            setStatusText('');
        }
    };

    if (fetching) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">{isEditMode ? 'Edit Brand' : 'Add New Brand'}</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g. Lay's"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Logo</label>
                    <div className="mt-1 flex items-center gap-4">
                        {formData.logo && (
                            <img src={formData.logo} alt="Preview" className="h-16 w-16 object-contain border border-gray-300 rounded-md bg-gray-50" />
                        )}
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Other Info</label>
                    <input
                        type="text"
                        name="other"
                        value={formData.other}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/brands')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                    >
                        {loading ? (statusText || 'Saving...') : (isEditMode ? 'Update Brand' : 'Create Brand')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BrandForm;
