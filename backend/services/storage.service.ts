import { supabase } from './supabase';

export const storageService = {
    async uploadFile(bucket: string, path: string, file: File | Blob) {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, { upsert: true });
        if (error) throw error;
        return data;
    },

    getPublicUrl(bucket: string, path: string) {
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);
        return data.publicUrl;
    },

    async getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn);
        if (error) throw error;
        return data.signedUrl;
    },

    async deleteFile(bucket: string, paths: string[]) {
        const { error } = await supabase.storage
            .from(bucket)
            .remove(paths);
        if (error) throw error;
    },
};
