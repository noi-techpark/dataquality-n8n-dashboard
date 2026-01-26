import { useState, useEffect } from 'react';
import { API_CONFIG } from '../utils/constants';
import { useAuth } from './useAuth';
import { auth } from '../utils/auth'; // Keep this for auth.getToken()

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
                const response = await fetch(API_CONFIG.METADATA_URL);

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                const items = data.Items || [];

                const formatted = items
                    .map(formatDataset)
                    .sort((a, b) => a.label.localeCompare(b.label));

                setDatasets(formatted);
                setError('');
            } catch (err) {
                console.error('Dataset Fetch Error:', err);
                setError('Failed to load datasets.');
            } finally {
                setLoading(false);
            }
        };

        fetchDatasets();
    }, []);

    return { datasets, loading, error };
};
