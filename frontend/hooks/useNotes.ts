import { useState, useEffect, useCallback } from 'react';
import { notesService, type Note, type NoteInsert, type NoteUpdate } from '../services/notes.service';

export function useNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'created_at' | 'title' | 'category'>('created_at');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchNotes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = searchQuery
                ? await notesService.searchNotes(searchQuery)
                : await notesService.getNotes(sortBy);
            setNotes(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [sortBy, searchQuery]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const createNote = async (note: NoteInsert) => {
        const newNote = await notesService.createNote(note);
        setNotes(prev => [newNote, ...prev]);
        return newNote;
    };

    const updateNote = async (id: string, updates: NoteUpdate) => {
        const updatedNote = await notesService.updateNote(id, updates);
        setNotes(prev => prev.map(n => (n.id === id ? updatedNote : n)));
        return updatedNote;
    };

    const deleteNote = async (id: string) => {
        await notesService.deleteNote(id);
        setNotes(prev => prev.filter(n => n.id !== id));
    };

    return {
        notes,
        loading,
        error,
        sortBy,
        setSortBy,
        searchQuery,
        setSearchQuery,
        createNote,
        updateNote,
        deleteNote,
        refetch: fetchNotes,
    };
}
