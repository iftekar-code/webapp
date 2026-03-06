import {
    collection, doc, getDocs, addDoc, deleteDoc,
    query, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { storageService } from './storage.service';

export interface Infographic {
    id: string;
    user_id: string;
    original_image_url: string;
    generated_infographic_url: string;
    created_at: string;
}

const COLLECTION = 'infographics';

function docToInfographic(docSnap: any): Infographic {
    const d = docSnap.data();
    return {
        id: docSnap.id,
        user_id: d.user_id ?? '',
        original_image_url: d.original_image_url ?? '',
        generated_infographic_url: d.generated_infographic_url ?? '',
        created_at: d.created_at?.toDate?.().toISOString?.() ?? d.created_at ?? '',
    };
}

export const infographicsService = {
    async getInfographics() {
        const q = query(collection(db, COLLECTION), orderBy('created_at', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(docToInfographic);
    },

    async uploadAssignmentImage(userId: string, file: File) {
        const path = `${userId}/${Date.now()}_${file.name}`;
        await storageService.uploadFile('assignment-images', path, file);
        const url = await storageService.getSignedUrl('assignment-images', path);
        return { path, url };
    },

    async saveInfographic(userId: string, originalImageUrl: string, infographicBlob: Blob) {
        const path = `${userId}/${Date.now()}_infographic.png`;
        await storageService.uploadFile('infographics', path, infographicBlob);
        const publicUrl = await storageService.getPublicUrl('infographics', path);

        const now = Timestamp.now();
        const docRef = await addDoc(collection(db, COLLECTION), {
            user_id: userId,
            original_image_url: originalImageUrl,
            generated_infographic_url: publicUrl,
            created_at: now,
        });

        return {
            id: docRef.id,
            user_id: userId,
            original_image_url: originalImageUrl,
            generated_infographic_url: publicUrl,
            created_at: now.toDate().toISOString(),
        } as Infographic;
    },

    async deleteInfographic(id: string, infographicUrl: string) {
        // Try to extract path and delete from storage
        try {
            const urlParts = infographicUrl.split('/infographics%2F');
            if (urlParts.length > 1) {
                const pathPart = urlParts[1].split('?')[0]; // Remove query params
                const path = decodeURIComponent(pathPart);
                await storageService.deleteFile('infographics', [path]).catch(() => { });
            }
        } catch {
            // Ignore storage deletion errors
        }

        await deleteDoc(doc(db, COLLECTION, id));
    },
};
