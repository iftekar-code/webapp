import { useState, useEffect, useRef, useCallback } from 'react';
import { useNotes } from '../hooks/useNotes';
import { NoteEditor } from '../components/notes/NoteEditor';
import { Modal } from '../components/common/Modal';
import { SkeletonList } from '../components/common/Loader';
import { audioService, type AudioFile } from '../services/audio.service';
import type { Note, NoteInsert } from '../services/notes.service';
import { toast } from 'react-toastify';
import {
    HiDocumentText,
    HiMusicalNote,
    HiMagnifyingGlass,
    HiPlus,
    HiPencilSquare,
    HiTrash,
    HiArrowUpTray,
    HiSpeakerWave,
    HiLockClosed,
    HiUser,
    HiArrowRightOnRectangle,
    HiShieldCheck,
} from 'react-icons/hi2';
import './AdminPanel.css';

// ─── Admin credentials (change these as needed) ───────────────────────────────
const ADMIN_NAMES = ['rajib', 'om'];   // allowed admin names (case-insensitive)
const ADMIN_PASSWORD = 'rajibomifi@1';
const SESSION_KEY = 'admin_session';
// ─────────────────────────────────────────────────────────────────────────────

function AdminLogin({ onSuccess }: { onSuccess: (name: string) => void }) {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim() || !password) { setError('Please enter your name and password.'); return; }
        setLoading(true);
        // Simulate a tiny delay for UX
        await new Promise(r => setTimeout(r, 600));
        if (ADMIN_NAMES.includes(name.trim().toLowerCase()) && password === ADMIN_PASSWORD) {
            localStorage.setItem(SESSION_KEY, name.trim());
            onSuccess(name.trim());
        } else {
            setError('Invalid name or password.');
        }
        setLoading(false);
    };

    return (
        <div className="admin-login-overlay">
            <div className="admin-login-card">
                <div className="admin-login-icon">
                    <HiShieldCheck size={32} />
                </div>
                <h2 className="admin-login-title">Admin Access</h2>
                <p className="admin-login-sub">Enter your credentials to manage content</p>

                <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
                    <div className="admin-login-field">
                        <label htmlFor="admin-name">Name</label>
                        <div className="admin-login-input-wrap">
                            <HiUser size={17} />
                            <input
                                id="admin-name"
                                type="text"
                                placeholder="Your admin name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                autoComplete="username"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="admin-login-field">
                        <label htmlFor="admin-password">Password</label>
                        <div className="admin-login-input-wrap">
                            <HiLockClosed size={17} />
                            <input
                                id="admin-password"
                                type={showPw ? 'text' : 'password'}
                                placeholder="••••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="admin-login-show-pw"
                                onClick={() => setShowPw(p => !p)}
                                tabIndex={-1}
                            >
                                {showPw ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    {error && <div className="admin-login-error">{error}</div>}

                    <button
                        className="admin-login-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? <span className="admin-login-spinner" /> : null}
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}

type Tab = 'notes' | 'audio';

export default function AdminPanel() {
    // ── Auth gate ───────────────────────────────────────────────────────────
    const [adminName, setAdminName] = useState<string | null>(
        () => localStorage.getItem(SESSION_KEY)
    );

    const handleLogout = () => {
        localStorage.removeItem(SESSION_KEY);
        setAdminName(null);
        toast.info('Logged out of admin panel');
    };

    if (!adminName) {
        return <AdminLogin onSuccess={name => setAdminName(name)} />;
    }
    // ────────────────────────────────────────────────────────────────────────
    const {
        notes,
        loading: notesLoading,
        searchQuery: noteSearch,
        setSearchQuery: setNoteSearch,
        createNote,
        updateNote,
        deleteNote,
    } = useNotes();

    // Audio state
    const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
    const [audioLoading, setAudioLoading] = useState(true);
    const [audioSearch, setAudioSearch] = useState('');

    // UI state
    const [activeTab, setActiveTab] = useState<Tab>('notes');
    const [noteEditorOpen, setNoteEditorOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'note' | 'audio'; id: string; name: string; filePath?: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Audio upload state
    const [showAudioUpload, setShowAudioUpload] = useState(false);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioTitle, setAudioTitle] = useState('');
    const [audioDesc, setAudioDesc] = useState('');
    const [audioCategory, setAudioCategory] = useState('');
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch audio
    const fetchAudio = useCallback(async () => {
        try {
            setAudioLoading(true);
            const data = audioSearch
                ? await audioService.searchAudio(audioSearch)
                : await audioService.getAudioFiles();
            setAudioFiles(data);
        } catch (err: any) {
            toast.error(err.message || 'Failed to load audio files');
        } finally {
            setAudioLoading(false);
        }
    }, [audioSearch]);

    useEffect(() => { fetchAudio(); }, [fetchAudio]);

    // Note handlers
    const handleSaveNote = async (note: NoteInsert) => {
        try {
            if (editingNote) {
                await updateNote(editingNote.id, note);
                toast.success('Note updated!');
            } else {
                await createNote(note);
                toast.success('Note created!');
            }
            setEditingNote(null);
        } catch (err: any) {
            toast.error(err.message || 'Failed to save note');
            throw err;
        }
    };

    const handleEditNote = (note: Note) => {
        setEditingNote(note);
        setNoteEditorOpen(true);
    };

    const handleAddNote = () => {
        setEditingNote(null);
        setNoteEditorOpen(true);
    };

    // Audio upload handlers
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('audio/')) {
            setAudioFile(file);
            setAudioTitle(file.name.replace(/\.[^/.]+$/, ''));
            setShowAudioUpload(true);
        } else {
            toast.error('Please drop a valid audio file');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioFile(file);
            setAudioTitle(file.name.replace(/\.[^/.]+$/, ''));
            setShowAudioUpload(true);
        }
    };

    const handleUploadAudio = async () => {
        if (!audioFile || !audioTitle.trim()) return;
        try {
            setUploading(true);
            const newAudio = await audioService.uploadAudio(audioFile, {
                title: audioTitle.trim(),
                description: audioDesc || undefined,
                category: audioCategory || undefined,
            });
            setAudioFiles(prev => [newAudio, ...prev]);
            toast.success('Audio uploaded!');
            resetAudioForm();
        } catch (err: any) {
            toast.error(err.message || 'Failed to upload audio');
        } finally {
            setUploading(false);
        }
    };

    const resetAudioForm = () => {
        setShowAudioUpload(false);
        setAudioFile(null);
        setAudioTitle('');
        setAudioDesc('');
        setAudioCategory('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Delete handler
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            if (deleteTarget.type === 'note') {
                await deleteNote(deleteTarget.id);
                toast.success('Note deleted');
            } else {
                await audioService.deleteAudio(deleteTarget.id, deleteTarget.filePath!);
                setAudioFiles(prev => prev.filter(a => a.id !== deleteTarget.id));
                toast.success('Audio deleted');
            }
        } catch (err: any) {
            toast.error(err.message || 'Delete failed');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const AUDIO_CATEGORIES = ['Lecture', 'Podcast', 'Music', 'Narration', 'Other'];

    return (
        <div className="admin-panel">
            {/* Header */}
            <div className="admin-header">
                <div className="admin-header-row">
                    <div>
                        <h1>Admin Panel</h1>
                        <p>Welcome back, <strong>{adminName}</strong> · Manage notes and audio content</p>
                    </div>
                    <button className="admin-logout-btn" onClick={handleLogout} title="Logout">
                        <HiArrowRightOnRectangle size={18} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                <button className={`admin-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
                    <HiDocumentText size={18} />
                    Notes
                    <span className="tab-badge">{notes.length}</span>
                </button>
                <button className={`admin-tab ${activeTab === 'audio' ? 'active' : ''}`} onClick={() => setActiveTab('audio')}>
                    <HiMusicalNote size={18} />
                    Audio
                    <span className="tab-badge">{audioFiles.length}</span>
                </button>
            </div>

            {/* ========== NOTES TAB ========== */}
            {activeTab === 'notes' && (
                <div className="fade-in">
                    <div className="admin-toolbar">
                        <div className="admin-search">
                            <HiMagnifyingGlass size={18} />
                            <input
                                placeholder="Search notes..."
                                value={noteSearch}
                                onChange={e => setNoteSearch(e.target.value)}
                            />
                        </div>
                        <button className="admin-add-btn" onClick={handleAddNote}>
                            <HiPlus size={18} />
                            Add Note
                        </button>
                    </div>

                    {notesLoading ? (
                        <SkeletonList count={5} />
                    ) : notes.length === 0 ? (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">
                                <HiDocumentText size={32} />
                            </div>
                            <h3>{noteSearch ? 'No notes found' : 'No notes yet'}</h3>
                            <p>{noteSearch ? 'Try a different search term' : 'Click "Add Note" to create your first note.'}</p>
                        </div>
                    ) : (
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Content</th>
                                        <th>Category</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notes.map(note => (
                                        <tr key={note.id}>
                                            <td className="note-title-cell">{note.title}</td>
                                            <td className="note-content-cell">{note.content?.slice(0, 80) || '—'}</td>
                                            <td>
                                                {note.category ? <span className="category-badge">{note.category}</span> : '—'}
                                            </td>
                                            <td className="date-cell">{formatDate(note.updated_at)}</td>
                                            <td className="actions-cell">
                                                <button className="admin-action-btn" onClick={() => handleEditNote(note)} title="Edit">
                                                    <HiPencilSquare size={16} />
                                                </button>
                                                <button
                                                    className="admin-action-btn delete"
                                                    onClick={() => setDeleteTarget({ type: 'note', id: note.id, name: note.title })}
                                                    title="Delete"
                                                >
                                                    <HiTrash size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ========== AUDIO TAB ========== */}
            {activeTab === 'audio' && (
                <div className="fade-in">
                    <div className="admin-toolbar">
                        <div className="admin-search">
                            <HiMagnifyingGlass size={18} />
                            <input
                                placeholder="Search audio..."
                                value={audioSearch}
                                onChange={e => setAudioSearch(e.target.value)}
                            />
                        </div>
                        <button className="admin-add-btn" onClick={() => fileInputRef.current?.click()}>
                            <HiArrowUpTray size={18} />
                            Upload Audio
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="audio/*"
                            hidden
                            onChange={handleFileSelect}
                        />
                    </div>

                    {/* Upload Form */}
                    {showAudioUpload && audioFile && (
                        <div className="audio-upload-form">
                            <h3>
                                <HiArrowUpTray size={20} />
                                Upload Audio
                            </h3>

                            <div className="audio-file-preview">
                                <HiSpeakerWave size={24} />
                                <div className="audio-file-info">
                                    <div className="file-name">{audioFile.name}</div>
                                    <div className="file-size">{formatFileSize(audioFile.size)}</div>
                                </div>
                            </div>

                            <div className="audio-form-fields">
                                <div className="audio-form-field">
                                    <label>Title *</label>
                                    <input
                                        value={audioTitle}
                                        onChange={e => setAudioTitle(e.target.value)}
                                        placeholder="Audio title"
                                        required
                                    />
                                </div>
                                <div className="audio-form-field">
                                    <label>Category</label>
                                    <select value={audioCategory} onChange={e => setAudioCategory(e.target.value)}>
                                        <option value="">No category</option>
                                        {AUDIO_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="audio-form-field full-width">
                                    <label>Description</label>
                                    <textarea
                                        value={audioDesc}
                                        onChange={e => setAudioDesc(e.target.value)}
                                        placeholder="Optional description..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="audio-form-actions">
                                <button className="audio-cancel-btn" onClick={resetAudioForm}>Cancel</button>
                                <button className="audio-submit-btn" onClick={handleUploadAudio} disabled={uploading || !audioTitle.trim()}>
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Drop Zone (when no upload form open) */}
                    {!showAudioUpload && (
                        <div
                            className={`audio-upload-zone ${dragging ? 'dragging' : ''}`}
                            onDrop={handleDrop}
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="audio-upload-icon">
                                <HiArrowUpTray size={28} />
                            </div>
                            <h3>Drop audio files here</h3>
                            <p>or click to browse • MP3, WAV, OGG, M4A supported</p>
                        </div>
                    )}

                    {/* Audio Grid */}
                    {audioLoading ? (
                        <SkeletonList count={4} />
                    ) : audioFiles.length === 0 ? (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">
                                <HiMusicalNote size={32} />
                            </div>
                            <h3>{audioSearch ? 'No audio found' : 'No audio files yet'}</h3>
                            <p>{audioSearch ? 'Try a different search' : 'Upload your first audio file above.'}</p>
                        </div>
                    ) : (
                        <div className="audio-grid">
                            {audioFiles.map(audio => (
                                <div key={audio.id} className="audio-card">
                                    <div className="audio-card-header">
                                        <div className="audio-card-icon">
                                            <HiSpeakerWave size={22} />
                                        </div>
                                        <div className="audio-card-actions">
                                            <button
                                                className="admin-action-btn delete"
                                                onClick={() => setDeleteTarget({ type: 'audio', id: audio.id, name: audio.title, filePath: audio.file_path })}
                                                title="Delete"
                                            >
                                                <HiTrash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="audio-card-title">{audio.title}</div>
                                    {audio.description && <div className="audio-card-desc">{audio.description}</div>}
                                    <audio className="audio-card-player" controls preload="metadata" src={audio.file_url} />
                                    <div className="audio-card-meta">
                                        {audio.category ? <span className="audio-card-category">{audio.category}</span> : <span />}
                                        <span className="audio-card-date">{formatDate(audio.created_at)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Note Editor Modal */}
            <NoteEditor
                isOpen={noteEditorOpen}
                onClose={() => { setNoteEditorOpen(false); setEditingNote(null); }}
                onSave={handleSaveNote}
                editNote={editingNote}
            />

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete" size="sm">
                <div className="confirm-delete-body">
                    <p>
                        Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>?
                        This action cannot be undone.
                    </p>
                    <div className="confirm-delete-actions">
                        <button className="cancel-btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
                        <button className="delete-btn" onClick={handleConfirmDelete} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
