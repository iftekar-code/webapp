import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../components/common/Loader';

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        // Auth is handled via localStorage — just redirect to home
        navigate('/home', { replace: true });
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
