import { useState, useEffect } from 'react';
import { API_CONFIG } from '../utils/constants';
import { auth } from '../utils/auth';

const categorizeDataset = (url) => {
    const urlLower = url?.toLowerCase() || '';

    if (urlLower.includes('mobility') || urlLower.includes('parking') ||
        urlLower.includes('traffic') || urlLower.includes('bicycle')) return 'mobility';
    if (urlLower.includes('weather') || urlLower.includes('meteo') ||
        urlLower.includes('snow')) return 'weather';
    if (urlLower.includes('tourism') || urlLower.includes('accommodation') ||
        urlLower.includes('event') || urlLower.includes('activity')) return 'tourism';
    if (urlLower.includes('environment') || urlLower.includes('airquality')) return 'environmental';
    if (urlLower.includes('charging') || urlLower.includes('energy') ||
        urlLower.includes('echarging')) return 'energy';

    return 'other';
};

const formatDataset = (item) => ({
    value: item.Id,
    label: item.Shortname || item.Title?.en || item.Title?.it || item.Title?.de || "Unnamed Dataset",
    category: item.Dataspace || categorizeDataset(item.ApiUrl),
    url: item.ApiUrl,
    source: item.Source,
    requiresAuth: item.OdhActive === false // Flag if dataset requires authentication
});

export const useFetchDatasets = () => {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(auth.isAuthenticated());

    useEffect(() => {
        let isMounted = true;

        const fetchDatasets = async () => {
            setLoading(true);
            try {
                const authenticated = auth.isAuthenticated();
                setIsAuthenticated(authenticated);

                const response = await fetch(API_CONFIG.METADATA_URL);

                if (!response.ok) {
                    const errorText = await response.text().catch(() => '');
                    throw new Error(`HTTP ${response.status}: ${errorText || 'Server Error'}`);
                }

                const data = await response.json();
                const items = data.Items || [];

                let formatted = items.map(formatDataset);

                formatted = formatted.sort((a, b) => a.label.localeCompare(b.label));

                if (isMounted) {
                    setDatasets(formatted);
                    setError('');
                }
            } catch (err) {
                console.error('[CRITICAL] Dataset Fetch Failure:', err);
                if (isMounted) {
                    setError(`Failed to load datasets: ${err.message}`);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDatasets();

        const handleAuthChange = () => fetchDatasets();
        window.addEventListener('auth-changed', handleAuthChange);

        return () => {
            isMounted = false;
            window.removeEventListener('auth-changed', handleAuthChange);
        };
    }, []);

    return { datasets, loading, error, isAuthenticated };
};
