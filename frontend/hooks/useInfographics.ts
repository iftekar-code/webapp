import { useState, useEffect, useCallback } from 'react';
import { infographicsService, type Infographic } from '../services/infographics.service';
import { useAuth } from '../contexts/AuthContext';

export function useInfographics() {
    const { user } = useAuth();
    const [infographics, setInfographics] = useState<Infographic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Use email as a simple user identifier
    const userId = user?.email?.replace(/[^a-zA-Z0-9]/g, '_') || 'anonymous';

    const fetchInfographics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await infographicsService.getInfographics();
            setInfographics(data);
        } catch (err: any) {
            setError(err.message);
            setInfographics([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInfographics();
    }, [fetchInfographics]);

    const uploadAndGenerate = async (file: File, generateFn: (imageUrl: string) => Promise<Blob>) => {
        if (!user) throw new Error('Not authenticated');

        const { url: originalUrl } = await infographicsService.uploadAssignmentImage(userId, file);
        const infographicBlob = await generateFn(originalUrl);
        const saved = await infographicsService.saveInfographic(userId, originalUrl, infographicBlob);
        setInfographics(prev => [saved, ...prev]);
        return saved;
    };

    const deleteInfographic = async (id: string, url: string) => {
        await infographicsService.deleteInfographic(id, url);
        setInfographics(prev => prev.filter(i => i.id !== id));
    };

    return {
        infographics,
        loading,
        error,
        uploadAndGenerate,
        deleteInfographic,
        refetch: fetchInfographics,
    };
}
