import React, { useState } from 'react';
// import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
// import { db } from '../../firebase';
// import { products } from '../../mockData';

const Migrate: React.FC = () => {
    const [status, setStatus] = useState('Idle');

    const handleMigrate = async () => {
        setStatus('Migration is disabled. Mock data has been removed.');
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Data Migration</h1>
            <p>Click below to upload mock products to Firestore.</p>
            <button onClick={handleMigrate} className="btn btn-primary">
                Migrate Products
            </button>
            <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>Status: {status}</p>
        </div>
    );
};

export default Migrate;
