import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HiSparkles, HiBookOpen, HiAcademicCap, HiEnvelope, HiUser, HiArrowRight } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import './Auth.css';

export default function Auth() {
    const { user, enterApp } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    if (user) return <Navigate to="/home" replace />;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            toast.error('Please enter your name and email');
            return;
        }

        try {
            setLoading(true);
            await enterApp(name.trim(), email.trim());
        } catch (err: any) {
            toast.error(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-background">
                <div className="auth-bg-shape shape-1" />
                <div className="auth-bg-shape shape-2" />
                <div className="auth-bg-shape shape-3" />
            </div>

            <div className="auth-card">
                <div className="auth-brand">
                    <div className="auth-logo-icon">
                        <HiAcademicCap size={32} />
                    </div>
                    <h1 className="auth-title">StudyEasily</h1>
                    <p className="auth-subtitle">Your companion for efficient studying</p>
                </div>

                <div className="auth-features">
                    <div className="auth-feature">
                        <HiBookOpen size={18} />
                        <span>Organize Notes</span>
                    </div>
                    <div className="auth-feature">
                        <HiSparkles size={18} />
                        <span>Generate Infographics</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-input-group">
                        <HiUser size={18} className="auth-input-icon" />
                        <input
                            type="text"
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="auth-input"
                            autoComplete="name"
                            required
                        />
                    </div>
                    <div className="auth-input-group">
                        <HiEnvelope size={18} className="auth-input-icon" />
                        <input
                            type="email"
                            placeholder="Your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="auth-input"
                            autoComplete="email"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? (
                            <span className="auth-btn-loading">
                                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                                Getting ready...
                            </span>
                        ) : (
                            <>
                                Get Started
                                <HiArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <p className="auth-footer">No password needed — just your name and email! 🎉</p>
            </div>
        </div>
    );
}
