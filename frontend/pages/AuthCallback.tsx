import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Spinner } from '../components/common/Loader';

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            const { error } = await supabase.auth.getSession();
            if (error) {
                console.error('Auth callback error:', error);
                navigate('/', { replace: true });
            } else {
                navigate('/home', { replace: true });
            }
        };
        handleCallback();
    }, [navigate]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: '16px',
        }}>
            <Spinner size={48} />
            <p style={{ color: 'var(--text-secondary)' }}>Signing you in...</p>
        </div>
    );
}
