import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { Category } from '../../types';
import { useToast } from '../../context/ToastContext';

const CategoryForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const isEditMode = !!id;

    const [form, setForm] = useState<Category>({
        name: '',
        image: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            fetchCategory(id);
        }
    }, [id]);

    const fetchCategory = async (catId: string) => {
        try {
            const docSnap = await getDoc(doc(db, 'categories', catId));
            if (docSnap.exists()) {
                setForm(docSnap.data() as Category);
            } else {
                showToast('Category not found', 'error');
                navigate('/admin/categories');
            }
        } catch (error) {
            console.error(error);
            showToast('Error fetching category', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditMode) {
                await updateDoc(doc(db, 'categories', id), { ...form });
                showToast('Category updated successfully', 'success');
            } else {
                await addDoc(collection(db, 'categories'), {
                    ...form,
                    createdAt: new Date().toISOString()
                });
                showToast('Category created successfully', 'success');
            }
            navigate('/admin/categories');
        } catch (error) {
            console.error(error);
            showToast('Failed to save category', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Category' : 'Add New Category'}</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                    <input
                        type="text"
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                        type="url"
                        required
                        placeholder="https://example.com/image.jpg"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                        value={form.image}
                        onChange={e => setForm({ ...form, image: e.target.value })}
                    />
                    {form.image && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Preview:</p>
                            <img src={form.image} alt="Preview" className="h-20 w-20 object-cover rounded border" />
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                        rows={3}
                        value={form.description || ''}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/categories')}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? 'Saving...' : 'Save Category'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CategoryForm;
