import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Keyword } from '../../types';
import { useToast } from '../../context/ToastContext';

const Keywords: React.FC = () => {
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [loading, setLoading] = useState(true);
    const [newKeyword, setNewKeyword] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        fetchKeywords();
    }, []);

    const fetchKeywords = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'keywords'));
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Keyword));
            // Sort alphabetically
            list.sort((a, b) => a.name.localeCompare(b.name));
            setKeywords(list);
        } catch (error) {
            console.error("Error fetching keywords", error);
            showToast("Failed to fetch keywords", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyword.trim()) return;

        // Check duplicate
        if (keywords.some(k => k.name.toLowerCase() === newKeyword.trim().toLowerCase())) {
            showToast("Keyword already exists", "error");
            return;
        }

        try {
            await addDoc(collection(db, 'keywords'), { name: newKeyword.trim().replace(/^#/, '') });
            showToast("Keyword added", "success");
            setNewKeyword('');
            fetchKeywords();
        } catch (error) {
            console.error(error);
            showToast("Failed to add keyword", "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure? This will not remove the keyword from existing products.")) return;
        try {
            await deleteDoc(doc(db, 'keywords', id));
            showToast("Keyword deleted", "success");
            setKeywords(prev => prev.filter(k => k.id !== id));
        } catch (error) {
            console.error(error);
            showToast("Failed to delete keyword", "error");
        }
    };

    const startEdit = (k: Keyword) => {
        setEditingId(k.id);
        setEditName(k.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    const handleUpdate = async () => {
        if (!editingId || !editName.trim()) return;
        try {
            await updateDoc(doc(db, 'keywords', editingId), { name: editName.trim().replace(/^#/, '') });
            showToast("Keyword updated", "success");
            setEditingId(null);
            setEditName('');
            fetchKeywords();
        } catch (error) {
            console.error(error);
            showToast("Failed to update keyword", "error");
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Keywords...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Manage Keywords / Hashtags</h1>

            <div style={{ marginBottom: '2rem', background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px' }}>
                <h3>Add New Keyword</h3>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <input
                        type="text"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="e.g. #spicy, vegan, party"
                        style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <button type="submit" className="btn btn-primary">Add</button>
                </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {keywords.map(k => (
                    <div key={k.id} style={{ background: '#fff', border: '1px solid #eee', padding: '1rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {editingId === k.id ? (
                            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    style={{ flex: 1, padding: '0.4rem' }}
                                />
                                <button onClick={handleUpdate} style={{ background: 'green', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}>✓</button>
                                <button onClick={cancelEdit} style={{ background: '#666', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                            </div>
                        ) : (
                            <>
                                <span style={{ fontWeight: '500' }}>#{k.name.replace(/^#/, '')}</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => startEdit(k)} style={{ background: '#e3f2fd', color: '#1565c0', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                                    <button onClick={() => handleDelete(k.id)} style={{ background: '#ffebee', color: '#c62828', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            {keywords.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>No keywords found. Add some above!</p>}
        </div>
    );
};

export default Keywords;
