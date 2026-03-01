import { NavLink } from 'react-router-dom';
import { HiHome, HiCog6Tooth, HiShieldCheck } from 'react-icons/hi2';
import './BottomNav.css';

export function BottomNav() {
    return (
        <nav className="bottom-nav" aria-label="Main navigation">
            <NavLink to="/home" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <HiHome size={24} />
                <span>Home</span>
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <HiShieldCheck size={24} />
                <span>Admin</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <HiCog6Tooth size={24} />
                <span>Settings</span>
            </NavLink>
        </nav>
    );
}
