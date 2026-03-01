import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/common/Modal';
import { HiSun, HiMoon, HiArrowRightOnRectangle, HiInformationCircle, HiHeart } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import './Settings.css';

export default function Settings() {
    const { theme, toggleTheme } = useTheme();
    const { signOut, user } = useAuth();
    const navigate = useNavigate();
    const [logoutConfirm, setLogoutConfirm] = useState(false);

    const handleLogout = () => {
        signOut();
        toast.success('Successfully logged out');
        navigate('/', { replace: true });
        setLogoutConfirm(false);
    };

    return (
        <div className="settings-page">
            <h1 className="settings-title">Settings</h1>

            <div className="settings-section">
                {/* User info */}
                <div className="settings-card settings-user">
                    <div className="settings-user-avatar">
                        {(user?.name?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                        <p className="settings-user-name">{user?.name || 'Student'}</p>
                        <p className="settings-user-email">{user?.email}</p>
                    </div>
                </div>

                {/* Theme Toggle */}
                <div className="settings-card settings-row" onClick={toggleTheme} role="button" tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && toggleTheme()}>
                    <div className="settings-row-left">
                        {theme === 'dark' ? <HiMoon size={22} /> : <HiSun size={22} />}
                        <div>
                            <p className="settings-row-label">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                            <p className="settings-row-desc">Toggle between light and dark theme</p>
                        </div>
                    </div>
                    <div className={`theme-toggle ${theme === 'dark' ? 'active' : ''}`}>
                        <div className="theme-toggle-thumb" />
                    </div>
                </div>

                {/* Logout */}
                <div className="settings-card settings-row logout-row" onClick={() => setLogoutConfirm(true)}
                    role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setLogoutConfirm(true)}>
                    <div className="settings-row-left">
                        <HiArrowRightOnRectangle size={22} />
                        <div>
                            <p className="settings-row-label">Logout</p>
                            <p className="settings-row-desc">Sign out of your account</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* About */}
            <div className="settings-section">
                <h2 className="settings-section-title">About</h2>
                <div className="settings-card settings-about">
                    <div className="about-header">
                        <HiInformationCircle size={22} className="about-icon" />
                        <div>
                            <p className="about-name">StudyEasily</p>
                            <p className="about-version">v1.0.0</p>
                        </div>
                    </div>
                    <p className="about-description">
                        Your companion for efficient studying and beautiful assignments.
                    </p>
                    <div className="about-links">
                        <a href="#" className="about-link">Terms of Service</a>
                        <a href="#" className="about-link">Privacy Policy</a>
                        <a href="mailto:support@studyeasily.com" className="about-link">Contact Support</a>
                    </div>
                    <p className="about-footer">
                        Made with <HiHeart size={14} className="about-heart" /> for students
                    </p>
                    <p className="about-copyright">© 2026 StudyEasily. All rights reserved.</p>
                </div>
            </div>

            {/* Logout Confirmation */}
            <Modal isOpen={logoutConfirm} onClose={() => setLogoutConfirm(false)} title="Logout" size="sm">
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
                    Are you sure you want to logout?
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => setLogoutConfirm(false)}
                        style={{ padding: '10px 20px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
                        Stay Logged In
                    </button>
                    <button onClick={handleLogout}
                        style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--error)', color: '#fff', fontWeight: 600, cursor: 'pointer', border: 'none' }}>
                        Logout
                    </button>
                </div>
            </Modal>
        </div>
    );
}
