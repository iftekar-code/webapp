import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

export const storageService = {
    async uploadFile(bucket: string, path: string, file: File | Blob) {
        const storageRef = ref(storage, `${bucket}/${path}`);
        const snapshot = await uploadBytes(storageRef, file);
        return { path: snapshot.ref.fullPath };
    },

    async getPublicUrl(bucket: string, path: string) {
        const storageRef = ref(storage, `${bucket}/${path}`);
        return await getDownloadURL(storageRef);
    },

    async getSignedUrl(bucket: string, path: string, _expiresIn = 3600) {
        // Firebase Storage download URLs are long-lived; no separate signed URL concept
        return await this.getPublicUrl(bucket, path);
    },

    async deleteFile(bucket: string, paths: string[]) {
        const promises = paths.map(p => {
            const storageRef = ref(storage, `${bucket}/${p}`);
            return deleteObject(storageRef);
        });
        await Promise.all(promises);
    },
};
