import { supabase } from './supabase';
import { storageService } from './storage.service';

export interface Infographic {
    id: string;
    user_id: string;
    original_image_url: string;
    generated_infographic_url: string;
    created_at: string;
}

export const infographicsService = {
    async getInfographics() {
        const { data, error } = await supabase
            .from('infographics')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as Infographic[];
    },

    async uploadAssignmentImage(userId: string, file: File) {
        const path = `${userId}/${Date.now()}_${file.name}`;
        await storageService.uploadFile('assignment-images', path, file);
        const signedUrl = await storageService.getSignedUrl('assignment-images', path);
        return { path, url: signedUrl };
    },

    async saveInfographic(userId: string, originalImageUrl: string, infographicBlob: Blob) {
        const path = `${userId}/${Date.now()}_infographic.png`;
        await storageService.uploadFile('infographics', path, infographicBlob);
        const publicUrl = storageService.getPublicUrl('infographics', path);

        const { data, error } = await supabase
            .from('infographics')
            .insert({
                user_id: userId,
                original_image_url: originalImageUrl,
                generated_infographic_url: publicUrl,
            })
            .select()
            .single();
        if (error) throw error;
        return data as Infographic;
    },

    async deleteInfographic(id: string, infographicUrl: string) {
        // Extract path from URL
        const urlParts = infographicUrl.split('/infographics/');
        if (urlParts.length > 1) {
            const path = decodeURIComponent(urlParts[1]);
            await storageService.deleteFile('infographics', [path]).catch(() => { });
        }

        const { error } = await supabase
            .from('infographics')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },
};
