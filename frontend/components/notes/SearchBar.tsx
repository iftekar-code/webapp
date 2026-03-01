import { HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';
import { useEffect, useState } from 'react';
import './SearchBar.css';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search notes...' }: SearchBarProps) {
    const [local, setLocal] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => onChange(local), 300);
        return () => clearTimeout(timer);
    }, [local, onChange]);

    useEffect(() => {
        setLocal(value);
    }, [value]);

    return (
        <div className="search-bar">
            <HiMagnifyingGlass size={18} className="search-icon" />
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                aria-label="Search"
            />
            {local && (
                <button className="search-clear" onClick={() => { setLocal(''); onChange(''); }} aria-label="Clear search">
                    <HiXMark size={16} />
                </button>
            )}
        </div>
    );
}
