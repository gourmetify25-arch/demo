import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Brand } from '../../types';
import { useToast } from '../../context/ToastContext';

const Brands: React.FC = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'brands'));
            const brandsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Brand));
            setBrands(brandsData);
        } catch (error) {
            console.error("Error fetching brands:", error);
            showToast("Failed to fetch brands", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this brand?')) {
            try {
                await deleteDoc(doc(db, 'brands', id));
                setBrands(brands.filter(brand => brand.id !== id));
                showToast('Brand deleted successfully', 'success');
            } catch (error) {
                console.error("Error deleting brand:", error);
                showToast("Failed to delete brand", "error");
            }
        }
    };

    if (loading) return <div className="p-8">Loading brands...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Brands</h1>
                <Link to="/admin/brands/new" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                    + Add New Brand
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {brands.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                    No brands found. Add one to get started!
                                </td>
                            </tr>
                        ) : (
                            brands.map((brand) => (
                                <tr key={brand.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {brand.logo ? (
                                            <img src={brand.logo} alt={brand.name} className="h-10 w-10 rounded-full object-contain bg-gray-50 border border-gray-200" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">No Img</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{brand.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{brand.description || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/admin/brands/${brand.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                                        <button onClick={() => handleDelete(brand.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Brands;
