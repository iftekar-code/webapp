import { supabase } from './supabase';

export interface AudioFile {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    file_url: string;
    file_path: string;
    duration: string | null;
    created_at: string;
}

export type AudioInsert = Pick<AudioFile, 'title'> & Partial<Pick<AudioFile, 'description' | 'category'>>;
export type AudioUpdate = Partial<Pick<AudioFile, 'title' | 'description' | 'category'>>;

export const audioService = {
    async getAudioFiles() {
        const { data, error } = await supabase
            .from('audio_files')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as AudioFile[];
    },

    async uploadAudio(file: File, meta: AudioInsert) {
        const ext = file.name.split('.').pop() || 'mp3';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const filePath = `uploads/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
            .from('audio-files')
            .upload(filePath, file, { upsert: false });
        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('audio-files')
            .getPublicUrl(filePath);

        // Insert DB row
        const { data, error } = await supabase
            .from('audio_files')
            .insert({
                title: meta.title,
                description: meta.description || null,
                category: meta.category || null,
                file_url: urlData.publicUrl,
                file_path: filePath,
            })
            .select()
            .single();
        if (error) throw error;
        return data as AudioFile;
    },

    async updateAudio(id: string, updates: AudioUpdate) {
        const { data, error } = await supabase
            .from('audio_files')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as AudioFile;
    },

    async deleteAudio(id: string, filePath: string) {
        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('audio-files')
            .remove([filePath]);
        if (storageError) throw storageError;

        // Delete DB row
        const { error } = await supabase
            .from('audio_files')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async searchAudio(query: string) {
        const { data, error } = await supabase
            .from('audio_files')
            .select('*')
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as AudioFile[];
    },
};
