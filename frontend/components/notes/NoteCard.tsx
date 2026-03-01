import { HiClock, HiBookOpen } from 'react-icons/hi2';
import type { Note } from '../../services/notes.service';
import './NoteCard.css';

interface NoteCardProps {
    note: Note;
    onView: (note: Note) => void;
}

function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export function NoteCard({ note, onView }: NoteCardProps) {
    const preview = note.content ? note.content.slice(0, 120) + (note.content.length > 120 ? '...' : '') : 'No content';

    return (
        <div className="note-card fade-in" onClick={() => onView(note)} tabIndex={0} role="button"
            onKeyDown={(e) => e.key === 'Enter' && onView(note)} aria-label={`View note: ${note.title}`}>
            <div className="note-card-header">
                <h3 className="note-card-title">{note.title}</h3>
            </div>
            <p className="note-card-preview">{preview}</p>
            <div className="note-card-footer">
                <span className="note-card-time">
                    <HiClock size={12} />
                    {timeAgo(note.updated_at)}
                </span>
                {note.category && <span className="note-card-category">{note.category}</span>}
                <HiBookOpen size={14} className="note-card-edit-icon" />
            </div>
        </div>
    );
}
