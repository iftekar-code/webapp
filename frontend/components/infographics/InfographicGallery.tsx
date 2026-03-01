import { HiTrash, HiArrowDownTray, HiPhoto } from 'react-icons/hi2';
import { SkeletonList } from '../common/Loader';
import { Modal } from '../common/Modal';
import { useState } from 'react';
import type { Infographic } from '../../services/infographics.service';
import './InfographicGallery.css';

interface InfographicGalleryProps {
    infographics: Infographic[];
    loading: boolean;
    onDelete: (id: string, url: string) => void;
}

export function InfographicGallery({ infographics, loading, onDelete }: InfographicGalleryProps) {
    const [viewImage, setViewImage] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Infographic | null>(null);

    const handleDownload = (url: string, index: number) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `infographic-${index + 1}.png`;
        a.target = '_blank';
        a.click();
    };

    if (loading) return <SkeletonList count={4} />;

    if (infographics.length === 0) {
        return (
            <div className="gallery-empty">
                <div className="gallery-empty-icon">
                    <HiPhoto size={48} />
                </div>
                <h3>No infographics yet</h3>
                <p>Upload an assignment image to generate your first infographic!</p>
            </div>
        );
    }

    return (
        <>
            <div className="gallery-grid">
                {infographics.map((item, i) => (
                    <div key={item.id} className="gallery-item fade-in">
                        <div className="gallery-thumb" onClick={() => setViewImage(item.generated_infographic_url)}>
                            <img src={item.generated_infographic_url} alt="Infographic" loading="lazy" />
                        </div>
                        <div className="gallery-item-footer">
                            <span className="gallery-item-date">
                                {new Date(item.created_at).toLocaleDateString()}
                            </span>
                            <div className="gallery-item-actions">
                                <button onClick={() => handleDownload(item.generated_infographic_url, i)} aria-label="Download">
                                    <HiArrowDownTray size={16} />
                                </button>
                                <button onClick={() => setConfirmDelete(item)} aria-label="Delete" className="gallery-delete-btn">
                                    <HiTrash size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* View full size */}
            <Modal isOpen={!!viewImage} onClose={() => setViewImage(null)} size="lg">
                {viewImage && <img src={viewImage} alt="Infographic full" style={{ width: '100%', borderRadius: 8 }} />}
            </Modal>

            {/* Delete confirmation */}
            <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Infographic" size="sm">
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
                    Are you sure you want to delete this infographic? This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => setConfirmDelete(null)}
                        style={{ padding: '10px 20px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { if (confirmDelete) { onDelete(confirmDelete.id, confirmDelete.generated_infographic_url); setConfirmDelete(null); } }}
                        style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--error)', color: '#fff', fontWeight: 600, cursor: 'pointer', border: 'none' }}
                    >
                        Delete
                    </button>
                </div>
            </Modal>
        </>
    );
}
