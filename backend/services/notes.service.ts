import {
    collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
    query, orderBy, where, Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION = 'notes';

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

function docToNote(docSnap: any): Note {
    const d = docSnap.data();
    return {
        id: docSnap.id,
        user_id: d.user_id ?? '',
        title: d.title ?? '',
        content: d.content ?? null,
        category: d.category ?? null,
        chapter: d.chapter ?? null,
        created_at: d.created_at?.toDate?.().toISOString?.() ?? d.created_at ?? '',
        updated_at: d.updated_at?.toDate?.().toISOString?.() ?? d.updated_at ?? '',
    };
}

export const notesService = {
    async getNotes(sortBy: 'created_at' | 'title' | 'category' = 'created_at') {
        let q;
        if (sortBy === 'title') {
            q = query(collection(db, COLLECTION), orderBy('title', 'asc'));
        } else if (sortBy === 'category') {
            q = query(collection(db, COLLECTION), orderBy('category', 'asc'), orderBy('created_at', 'desc'));
        } else {
            q = query(collection(db, COLLECTION), orderBy('created_at', 'desc'));
        }
        const snap = await getDocs(q);
        return snap.docs.map(docToNote);
    },

    async createNote(note: NoteInsert) {
        const now = Timestamp.now();
        const docRef = await addDoc(collection(db, COLLECTION), {
            ...note,
            user_id: '',
            created_at: now,
            updated_at: now,
        });
        return {
            id: docRef.id,
            user_id: '',
            ...note,
            created_at: now.toDate().toISOString(),
            updated_at: now.toDate().toISOString(),
        } as Note;
    },

    async updateNote(id: string, updates: NoteUpdate) {
        const ref = doc(db, COLLECTION, id);
        const now = Timestamp.now();
        await updateDoc(ref, { ...updates, updated_at: now });
        // Fetch the full updated document to return all fields
        const snap = await getDoc(ref);
        return docToNote(snap);
    },

    async deleteNote(id: string) {
        await deleteDoc(doc(db, COLLECTION, id));
    },

    async searchNotes(queryStr: string) {
        // Firestore has no full-text search; fetch all and filter client-side
        const snap = await getDocs(query(collection(db, COLLECTION), orderBy('created_at', 'desc')));
        const all = snap.docs.map(docToNote);
        const lower = queryStr.toLowerCase();
        return all.filter(
            n => n.title.toLowerCase().includes(lower) ||
                (n.content?.toLowerCase().includes(lower) ?? false)
        );
    },

    async getNotesForChapter(category: string, chapter: string) {
        const q = query(
            collection(db, COLLECTION),
            where('category', '==', category),
            where('chapter', '==', chapter),
            orderBy('created_at', 'desc'),
        );
        const snap = await getDocs(q);
        return snap.docs.map(docToNote);
    },
};
