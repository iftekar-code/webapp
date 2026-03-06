import {
    collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
    query, orderBy, Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

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

const COLLECTION = 'audio_files';

function docToAudio(docSnap: any): AudioFile {
    const d = docSnap.data();
    return {
        id: docSnap.id,
        title: d.title ?? '',
        description: d.description ?? null,
        category: d.category ?? null,
        file_url: d.file_url ?? '',
        file_path: d.file_path ?? '',
        duration: d.duration ?? null,
        created_at: d.created_at?.toDate?.().toISOString?.() ?? d.created_at ?? '',
    };
}

export const audioService = {
    async getAudioFiles() {
        const q = query(collection(db, COLLECTION), orderBy('created_at', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(docToAudio);
    },

    async uploadAudio(file: File, meta: AudioInsert) {
        const ext = file.name.split('.').pop() || 'mp3';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const filePath = `uploads/${fileName}`;

        // Upload to Firebase Storage
        const storageRef = ref(storage, `audio-files/${filePath}`);
        await uploadBytes(storageRef, file);

        // Get download URL
        const fileUrl = await getDownloadURL(storageRef);

        // Insert Firestore document
        const now = Timestamp.now();
        const docData = {
            title: meta.title,
            description: meta.description || null,
            category: meta.category || null,
            file_url: fileUrl,
            file_path: filePath,
            duration: null,
            created_at: now,
        };
        const docRef = await addDoc(collection(db, COLLECTION), docData);

        return {
            id: docRef.id,
            ...docData,
            created_at: now.toDate().toISOString(),
        } as AudioFile;
    },

    async updateAudio(id: string, updates: AudioUpdate) {
        const docRef = doc(db, COLLECTION, id);
        await updateDoc(docRef, updates);
        return { id, ...updates } as AudioFile;
    },

    async deleteAudio(id: string, filePath: string) {
        // Delete from Firebase Storage
        const storageRef = ref(storage, `audio-files/${filePath}`);
        await deleteObject(storageRef);

        // Delete Firestore document
        await deleteDoc(doc(db, COLLECTION, id));
    },

    async searchAudio(queryStr: string) {
        // Client-side search (Firestore has no full-text search)
        const q = query(collection(db, COLLECTION), orderBy('created_at', 'desc'));
        const snap = await getDocs(q);
        const all = snap.docs.map(docToAudio);
        const lower = queryStr.toLowerCase();
        return all.filter(
            a => a.title.toLowerCase().includes(lower) ||
                (a.description?.toLowerCase().includes(lower) ?? false)
        );
    },
};
