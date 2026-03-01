import './GenerationProgress.css';

interface GenerationProgressProps {
    progress: number;
    message: string;
}

export function GenerationProgress({ progress, message }: GenerationProgressProps) {
    return (
        <div className="generation-progress">
            <div className="generation-spinner">
                <div className="spinner" style={{ width: 48, height: 48 }} />
            </div>
            <p className="generation-message">{message}</p>
            <div className="generation-bar-track">
                <div className="generation-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="generation-percent">{Math.round(progress)}%</span>
        </div>
    );
}
