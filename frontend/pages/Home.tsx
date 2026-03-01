import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotes } from '../hooks/useNotes';
import { useInfographics } from '../hooks/useInfographics';
import { NoteList } from '../components/notes/NoteList';
import { UploadZone } from '../components/infographics/UploadZone';
import { InfographicPreview } from '../components/infographics/InfographicPreview';
import { InfographicGallery } from '../components/infographics/InfographicGallery';
import { GenerationProgress } from '../components/infographics/GenerationProgress';
import { generateInfographic } from '../components/infographics/InfographicGenerator';
import { Modal } from '../components/common/Modal';
import { CLASS_10_SUBJECTS, type Subject } from '../data/subjectChapters';
import { notesService } from '../services/notes.service';
import { HiDocumentText, HiSparkles, HiChevronDown, HiBookOpen } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import type { Note } from '../services/notes.service';
import './Home.css';

// ─── Subject Accordion Component ────────────────────────────────────────────
function SubjectAccordion({ subject, onViewNote }: { subject: Subject; onViewNote: (note: Note) => void }) {
    const [open, setOpen] = useState(false);
    const [activeChapter, setActiveChapter] = useState<string | null>(null);
    const [chapterNotes, setChapterNotes] = useState<Note[]>([]);
    const [loadingNotes, setLoadingNotes] = useState(false);

    const handleChapterClick = useCallback(async (ch: string) => {
        if (activeChapter === ch) {
            setActiveChapter(null);
            setChapterNotes([]);
            return;
        }
        setActiveChapter(ch);
        setLoadingNotes(true);
        try {
            const notes = await notesService.getNotesForChapter(subject.category, ch);
            setChapterNotes(notes);
        } catch {
            setChapterNotes([]);
        } finally {
            setLoadingNotes(false);
        }
    }, [activeChapter, subject.category]);

    return (
        <div className={`subject-card ${open ? 'open' : ''}`} style={{ '--accent': subject.color } as React.CSSProperties}>
            <button className="subject-card-header" onClick={() => setOpen(o => !o)}>
                <span className="subject-emoji">{subject.emoji}</span>
                <span className="subject-name">{subject.name}</span>
                <span className="subject-count">{subject.chapters.length} ch.</span>
                <HiChevronDown className={`subject-chevron ${open ? 'rotated' : ''}`} size={18} />
            </button>
            {open && (
                <ol className="chapter-list">
                    {subject.chapters.map((ch, i) => (
                        <li key={i}>
                            <button
                                className={`chapter-btn ${activeChapter === ch ? 'active' : ''}`}
                                onClick={() => handleChapterClick(ch)}
                            >
                                {ch}
                            </button>
                            {activeChapter === ch && (
                                <div className="chapter-notes">
                                    {loadingNotes ? (
                                        <p className="chapter-notes-loading">Loading notes…</p>
                                    ) : chapterNotes.length === 0 ? (
                                        <p className="chapter-notes-empty">No notes available for this chapter yet.</p>
                                    ) : (
                                        <ul className="chapter-notes-list">
                                            {chapterNotes.map(note => (
                                                <li key={note.id}>
                                                    <button className="chapter-note-link" onClick={() => onViewNote(note)}>
                                                        <HiDocumentText size={14} />
                                                        {note.title}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}

type Tab = 'notes' | 'assignments';

export default function Home() {
    const { user } = useAuth();
    const { notes, loading: notesLoading, searchQuery, setSearchQuery, sortBy, setSortBy } = useNotes();
    const { infographics, loading: infographicsLoading, deleteInfographic, uploadAndGenerate } = useInfographics();

    const [activeTab, setActiveTab] = useState<Tab>('notes');

    // Note viewer
    const [viewingNote, setViewingNote] = useState<Note | null>(null);

    // Infographic state
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressMsg, setProgressMsg] = useState('');
    const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Infographic handlers
    const handleFilesSelect = (files: File[]) => {
        const newFiles = [...selectedFiles, ...files];
        const newPreviews = [...filePreviews, ...files.map(f => URL.createObjectURL(f))];
        setSelectedFiles(newFiles);
        setFilePreviews(newPreviews);
        setGeneratedBlob(null);
        setGeneratedUrl(null);
    };

    const handleClearFiles = (index?: number) => {
        if (typeof index === 'number') {
            const newFiles = [...selectedFiles];
            const newPreviews = [...filePreviews];
            URL.revokeObjectURL(newPreviews[index]);
            newFiles.splice(index, 1);
            newPreviews.splice(index, 1);
            setSelectedFiles(newFiles);
            setFilePreviews(newPreviews);
        } else {
            filePreviews.forEach(p => URL.revokeObjectURL(p));
            setSelectedFiles([]);
            setFilePreviews([]);
            setGeneratedBlob(null);
            setGeneratedUrl(null);
        }
    };

    const handleGenerate = async () => {
        if (selectedFiles.length === 0) return;
        try {
            setGenerating(true);

            const blob = await generateInfographic(selectedFiles, (p, msg) => {
                setProgress(p);
                setProgressMsg(msg);
            });

            const url = URL.createObjectURL(blob);
            setGeneratedBlob(blob);
            setGeneratedUrl(url);
            setProgress(100);
            toast.success('Infographic generated!');
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Generation failed');
        } finally {
            setGenerating(false);
            setProgress(0);
        }
    };

    const handleDownload = () => {
        if (!generatedUrl) return;
        const a = document.createElement('a');
        a.href = generatedUrl;
        a.download = 'infographic.png';
        a.click();
    };

    const handleSaveToGallery = async () => {
        if (selectedFiles.length === 0 || !generatedBlob || !user) return;
        try {
            setSaving(true);
            // We upload the first file as the "source" image for now, and the generated blob as the result
            const mainFile = selectedFiles[0];
            await uploadAndGenerate(mainFile, async () => generatedBlob);
            toast.success('Saved to gallery!');
            handleClearFiles();
        } catch (err: any) {
            toast.error(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteInfographic = async (id: string, url: string) => {
        try {
            await deleteInfographic(id, url);
            toast.success('Infographic deleted');
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete');
        }
    };

    const firstName = user?.name?.split(' ')[0] || 'Student';

    return (
        <div className="home-page">
            <div className="class-banner">
                <span className="class-banner-label">📚 Class 10</span>
            </div>
            <div className="home-header">
                <div>
                    <h1 className="home-welcome">Welcome back, {firstName}! 👋</h1>
                    <p className="home-subtitle">What would you like to work on today?</p>
                </div>
            </div>

            <div className="home-tabs">
                <button className={`home-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
                    <HiDocumentText size={18} />
                    Notes
                </button>
                <button className={`home-tab ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>
                    <HiSparkles size={18} />
                    Assignments
                </button>
            </div>

            {activeTab === 'notes' && (
                <div className="home-section fade-in">
                    {/* Subjects & Chapters */}
                    <div className="subjects-section">
                        <h2 className="section-title"><HiBookOpen size={22} /> Subjects & Chapters</h2>
                        <div className="subjects-grid">
                            {CLASS_10_SUBJECTS.map(subject => (
                                <SubjectAccordion key={subject.name} subject={subject} onViewNote={setViewingNote} />
                            ))}
                        </div>
                    </div>

                    <h2 className="section-title" style={{ marginTop: 'var(--space-2xl)' }}>📋 All Notes</h2>
                    <NoteList
                        notes={notes}
                        loading={notesLoading}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        onView={setViewingNote}
                    />
                </div>
            )}

            {activeTab === 'assignments' && (
                <div className="home-section fade-in">
                    <div className="assignments-layout">
                        <div className="assignments-upload-section">
                            <h2 className="section-title">Generate Infographic</h2>
                            {generating ? (
                                <GenerationProgress progress={progress} message={progressMsg} />
                            ) : generatedUrl ? (
                                <InfographicPreview
                                    imageUrl={generatedUrl}
                                    onDownload={handleDownload}
                                    onRegenerate={handleGenerate}
                                    onSave={handleSaveToGallery}
                                    saving={saving}
                                />
                            ) : (
                                <>
                                    <UploadZone
                                        onFilesSelect={handleFilesSelect}
                                        selectedFiles={selectedFiles}
                                        onClear={handleClearFiles}
                                        previews={filePreviews}
                                    />
                                    {selectedFiles.length > 0 && (
                                        <button className="generate-btn" onClick={handleGenerate}>
                                            <HiSparkles size={20} />
                                            Generate Infographic
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="assignments-gallery-section">
                            <h2 className="section-title">Your Gallery</h2>
                            <InfographicGallery
                                infographics={infographics}
                                loading={infographicsLoading}
                                onDelete={handleDeleteInfographic}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Note Viewer Modal (read-only) */}
            <Modal isOpen={!!viewingNote} onClose={() => setViewingNote(null)} title={viewingNote?.title || ''} size="lg">
                {viewingNote && (
                    <div className="note-viewer">
                        {viewingNote.category && (
                            <span className="note-viewer-category">{viewingNote.category}</span>
                        )}
                        <div className="note-viewer-content">
                            {viewingNote.content?.split('\n').map((line, i) => (
                                <p key={i}>{line || '\u00A0'}</p>
                            )) || <p style={{ color: 'var(--text-secondary)' }}>No content</p>}
                        </div>
                        <p className="note-viewer-date">
                            Last updated: {new Date(viewingNote.updated_at).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
