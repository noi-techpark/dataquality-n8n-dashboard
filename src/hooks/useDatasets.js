import { useState, useEffect } from 'react';
import { auth } from '../utils/auth';
import { API_CONFIG } from '../utils/constants';

const formatDataset = (item) => ({
    value: item.Id,
    label: item.Shortname || item.Title?.en || item.Title?.it || item.Title?.de || "Unnamed Dataset",
    category: item.Dataspace,
    url: item.ApiUrl,
    source: item.Source
});

export const useFetchDatasets = () => {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDatasets = async () => {
            try {
                // TODO: For Authenticated Users (Non-Guest):
                // Replace this URL with your backend API endpoint if authenticated users need different data.
                // const isGuest = auth.getUser()?.role === 'guest';
                // const url = isGuest ? API_CONFIG.METADATA_URL : 'YOUR_BACKEND_API_URL/datasets';

                const response = await fetch(API_CONFIG.METADATA_URL, {
                    headers: {
                        'Authorization': `Bearer ${auth.getToken()}`
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch datasets');

                const data = await response.json();
                const formatted = data.Items
                    .map(formatDataset)
                    .sort((a, b) => a.label.localeCompare(b.label));

                setDatasets(formatted);
            } catch (err) {
                setError('Failed to load datasets. Please refresh the page.');
                console.error('Error fetching datasets:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDatasets();
    }, []);

    return { datasets, loading, error };
};
