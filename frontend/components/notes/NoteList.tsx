import { NoteCard } from './NoteCard';
import { SearchBar } from './SearchBar';
import { SkeletonList } from '../common/Loader';
import { HiDocumentText, HiBarsArrowDown } from 'react-icons/hi2';
import type { Note } from '../../services/notes.service';
import './NoteList.css';

interface NoteListProps {
    notes: Note[];
    loading: boolean;
    searchQuery: string;
    onSearchChange: (q: string) => void;
    sortBy: 'created_at' | 'title' | 'category';
    onSortChange: (s: 'created_at' | 'title' | 'category') => void;
    onView: (note: Note) => void;
}

export function NoteList({ notes, loading, searchQuery, onSearchChange, sortBy, onSortChange, onView }: NoteListProps) {
    return (
        <div className="note-list-container">
            <div className="note-list-toolbar">
                <SearchBar value={searchQuery} onChange={onSearchChange} />
                <div className="note-list-sort">
                    <HiBarsArrowDown size={16} />
                    <select value={sortBy} onChange={(e) => onSortChange(e.target.value as any)} aria-label="Sort notes">
                        <option value="created_at">Recent</option>
                        <option value="title">Alphabetical</option>
                        <option value="category">Category</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <SkeletonList count={6} />
            ) : notes.length === 0 ? (
                <div className="note-list-empty">
                    <div className="note-list-empty-icon">
                        <HiDocumentText size={48} />
                    </div>
                    <h3>{searchQuery ? 'No notes found' : 'No notes available yet'}</h3>
                    <p>{searchQuery ? 'Try a different search term' : 'Notes will appear here when added by your instructor.'}</p>
                </div>
            ) : (
                <div className="note-list-grid">
                    {notes.map(note => (
                        <NoteCard key={note.id} note={note} onView={onView} />
                    ))}
                </div>
            )}
        </div>
    );
}
