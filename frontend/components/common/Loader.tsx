import './Loader.css';

export function Spinner({ size = 40 }: { size?: number }) {
    return <div className="spinner" style={{ width: size, height: size }} aria-label="Loading" />;
}

export function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text skeleton-short" />
            <div className="skeleton skeleton-badge" />
        </div>
    );
}

export function SkeletonList({ count = 6 }: { count?: number }) {
    return (
        <div className="skeleton-grid">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
