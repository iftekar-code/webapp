import { NavLink } from 'react-router-dom';
import { HiHome, HiCog6Tooth, HiChevronLeft, HiChevronRight, HiShieldCheck } from 'react-icons/hi2';
import { useState } from 'react';
import './Sidebar.css';

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="sidebar-header">
                {!collapsed && <h1 className="sidebar-logo">StudyEasily</h1>}
                <button
                    className="sidebar-toggle"
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <HiChevronRight size={20} /> : <HiChevronLeft size={20} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/home" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <HiHome size={22} />
                    {!collapsed && <span>Home</span>}
                </NavLink>
                <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <HiShieldCheck size={22} />
                    {!collapsed && <span>Admin</span>}
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <HiCog6Tooth size={22} />
                    {!collapsed && <span>Settings</span>}
                </NavLink>
            </nav>
        </aside>
    );
}
