import { HiArrowDownTray, HiArrowPath, HiBookmarkSquare } from 'react-icons/hi2';
import './InfographicPreview.css';

interface InfographicPreviewProps {
    imageUrl: string;
    onDownload: () => void;
    onRegenerate: () => void;
    onSave: () => void;
    saving?: boolean;
}

export function InfographicPreview({ imageUrl, onDownload, onRegenerate, onSave, saving }: InfographicPreviewProps) {
    return (
        <div className="infographic-preview fade-in">
            <div className="infographic-preview-image-wrapper">
                <img src={imageUrl} alt="Generated infographic" className="infographic-preview-image" />
            </div>
            <div className="infographic-preview-actions">
                <button className="infographic-action-btn primary" onClick={onDownload}>
                    <HiArrowDownTray size={18} />
                    Download
                </button>
                <button className="infographic-action-btn secondary" onClick={onRegenerate}>
                    <HiArrowPath size={18} />
                    Regenerate
                </button>
                <button className="infographic-action-btn save" onClick={onSave} disabled={saving}>
                    <HiBookmarkSquare size={18} />
                    {saving ? 'Saving...' : 'Save to Gallery'}
                </button>
            </div>
        </div>
    );
}
