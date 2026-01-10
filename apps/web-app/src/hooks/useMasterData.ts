import { useState, useEffect } from 'react';
import { api } from '@/lib/api/api-client';

export interface MasterData {
    soilTypes: Array<{ id: string; label: string; labelEN: string }>;
    waterSources: Array<{ id: string; label: string; labelEN: string }>;
    cultivationSystems: Array<{ id: string; label: string; labelEN: string }>;
    plantParts: Array<{ id: string; label: string; labelEN: string }>;
    ownershipTypes: Array<{ id: string; label: string; labelEN: string }>;
    plotTypes?: Array<{ id: string; label: string; icon: string }>;
}

export function useMasterData() {
    const [data, setData] = useState<MasterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get<MasterData>('/master-data');
                if (response.success && response.data) {
                    setData(response.data);
                } else {
                    setError('Failed to load master data');
                }
            } catch (err) {
                console.error('Master Data fetch error:', err);
                setError('Error connecting to server');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
}
