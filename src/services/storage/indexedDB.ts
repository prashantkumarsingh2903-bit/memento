import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface MementoDB extends DBSchema {
  media: {
    key: string;
    value: {
      id: string;
      blob: Blob;
      mimeType: string;
      createdAt: string;
    };
  };
}

const DB_NAME = 'memento_media_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MementoDB>> | null = null;

function getDB(): Promise<IDBPDatabase<MementoDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MementoDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('media')) {
          db.createObjectStore('media', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function storeMediaBlob(id: string, blob: Blob): Promise<string> {
  try {
    const db = await getDB();
    await db.put('media', {
      id,
      blob,
      mimeType: blob.type,
      createdAt: new Date().toISOString(),
    });
    return id;
  } catch (error) {
    console.warn('IndexedDB write failed, falling back:', error);
    return id;
  }
}

export async function getMediaBlob(id: string): Promise<Blob | null> {
  try {
    const db = await getDB();
    const item = await db.get('media', id);
    return item ? item.blob : null;
  } catch (error) {
    console.warn('IndexedDB read failed:', error);
    return null;
  }
}

export async function deleteMediaBlob(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('media', id);
  } catch (error) {
    console.warn('IndexedDB delete failed:', error);
  }
}

export async function clearAllMediaBlobs(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear('media');
  } catch (error) {
    console.warn('IndexedDB clear failed:', error);
  }
}
