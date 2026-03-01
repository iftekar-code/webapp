import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CATEGORY_TO_SUBJECT, CLASS_10_SUBJECTS } from '../../data/subjectChapters';
import type { Note, NoteInsert } from '../../services/notes.service';
import './NoteEditor.css';

interface NoteEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (note: NoteInsert) => Promise<void>;
    editNote?: Note | null;
}

const CATEGORIES = CLASS_10_SUBJECTS.map(s => s.category);

export function NoteEditor({ isOpen, onClose, onSave, editNote }: NoteEditorProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [chapter, setChapter] = useState('');
    const [saving, setSaving] = useState(false);

    // Get chapters for the selected category
    const selectedSubject = category ? CATEGORY_TO_SUBJECT.get(category) : null;
    const chapters = selectedSubject?.chapters ?? [];

    useEffect(() => {
        if (editNote) {
            setTitle(editNote.title);
            setContent(editNote.content || '');
            setCategory(editNote.category || '');
            setChapter(editNote.chapter || '');
        } else {
            setTitle('');
            setContent('');
            setCategory('');
            setChapter('');
        }
    }, [editNote, isOpen]);

    // Reset chapter when category changes (unless loading an edit)
    const handleCategoryChange = (newCat: string) => {
        setCategory(newCat);
        setChapter('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        try {
            setSaving(true);
            await onSave({
                title: title.trim(),
                content,
                category: category || null,
                chapter: chapter || null,
            });
            onClose();
        } catch {
            // Error handled by parent
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editNote ? 'Edit Note' : 'Create Note'} size="md">
            <form className="note-editor" onSubmit={handleSubmit}>
                <div className="note-editor-field">
                    <label htmlFor="noteTitle">Title</label>
                    <input
                        id="noteTitle"
                        type="text"
                        placeholder="Note title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        autoFocus
                    />
                </div>

                <div className="note-editor-field">
                    <label htmlFor="noteContent">Content</label>
                    <textarea
                        id="noteContent"
                        placeholder="Write your notes here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                    />
                    <span className="note-editor-charcount">{content.length} characters</span>
                </div>

                <div className="note-editor-row">
                    <div className="note-editor-field">
                        <label htmlFor="noteCategory">Subject</label>
                        <select id="noteCategory" value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
                            <option value="">No subject</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>
                                    {CATEGORY_TO_SUBJECT.get(cat)?.name ?? cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="note-editor-field">
                        <label htmlFor="noteChapter">Chapter</label>
                        <select
                            id="noteChapter"
                            value={chapter}
                            onChange={(e) => setChapter(e.target.value)}
                            disabled={!category || chapters.length === 0}
                        >
                            <option value="">No chapter</option>
                            {chapters.map((ch, i) => (
                                <option key={i} value={ch}>{`${i + 1}. ${ch}`}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="note-editor-actions">
                    <button type="button" className="note-editor-cancel" onClick={onClose}>Cancel</button>
                    <button type="submit" className="note-editor-save" disabled={saving || !title.trim()}>
                        {saving ? 'Saving...' : (editNote ? 'Save Changes' : 'Create Note')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
