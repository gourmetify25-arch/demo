import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Category } from '../../types';
import { useToast } from '../../context/ToastContext';

const Categories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'categories'));
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
            setCategories(list);
        } catch (error) {
            console.error(error);
            showToast('Failed to fetch categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await deleteDoc(doc(db, 'categories', id));
            setCategories(prev => prev.filter(c => c.id !== id));
            showToast('Category deleted', 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to delete', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading categories...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Categories</h1>
                <Link to="/admin/categories/new" className="btn btn-primary">
                    + Add New
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-left font-medium text-gray-500">Image</th>
                            <th className="p-4 text-left font-medium text-gray-500">Name</th>
                            <th className="p-4 text-left font-medium text-gray-500">Description</th>
                            <th className="p-4 text-right font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td className="p-4">
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                    />
                                </td>
                                <td className="p-4 font-medium">{category.name}</td>
                                <td className="p-4 text-gray-500 text-sm">{category.description || '-'}</td>
                                <td className="p-4 text-right space-x-2">
                                    <Link
                                        to={`/admin/categories/${category.id}`}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(category.id!)}
                                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    No categories found. Add one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Categories;
