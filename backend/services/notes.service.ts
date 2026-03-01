import { supabase } from './supabase';

export interface Note {
    id: string;
    user_id: string;
    title: string;
    content: string | null;
    category: string | null;
    chapter: string | null;
    created_at: string;
    updated_at: string;
}

export type NoteInsert = Pick<Note, 'title' | 'content' | 'category' | 'chapter'>;
export type NoteUpdate = Partial<NoteInsert>;

export const notesService = {
    async getNotes(sortBy: 'created_at' | 'title' | 'category' = 'created_at') {
        let query = supabase.from('notes').select('*');

        if (sortBy === 'title') {
            query = query.order('title', { ascending: true });
        } else if (sortBy === 'category') {
            query = query.order('category', { ascending: true }).order('created_at', { ascending: false });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Note[];
    },

    async createNote(note: NoteInsert) {
        const { data, error } = await supabase
            .from('notes')
            .insert(note)
            .select()
            .single();
        if (error) throw error;
        return data as Note;
    },

    async updateNote(id: string, updates: NoteUpdate) {
        const { data, error } = await supabase
            .from('notes')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Note;
    },

    async deleteNote(id: string) {
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async searchNotes(query: string) {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as Note[];
    },

    async getNotesForChapter(category: string, chapter: string) {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('category', category)
            .eq('chapter', chapter)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as Note[];
    },
};
