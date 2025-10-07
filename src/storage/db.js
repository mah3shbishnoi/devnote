/**
 * IndexedDB Database Service for DevNote
 * Manages document storage, folder hierarchy, and full-text search indexes
 */

import { INITIAL_FOLDERS, INITIAL_DOCUMENTS } from './seeds.js';

const DB_NAME = 'devnote_db';
const DB_VERSION = 1;

let dbInstance = null;

export async function openDB() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Folders store
      if (!db.objectStoreNames.contains('folders')) {
        const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
        folderStore.createIndex('parentId', 'parentId', { unique: false });
        folderStore.createIndex('name', 'name', { unique: false });
      }

      // Documents store
      if (!db.objectStoreNames.contains('documents')) {
        const docStore = db.createObjectStore('documents', { keyPath: 'id' });
        docStore.createIndex('folderId', 'folderId', { unique: false });
        docStore.createIndex('title', 'title', { unique: false });
        docStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // App Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = async (event) => {
      dbInstance = event.target.result;
      
      // Check if first-time seed is required
      await seedInitialDataIfEmpty(dbInstance);
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };
  });
}

async function seedInitialDataIfEmpty(db) {
  const count = await new Promise((resolve) => {
    const tx = db.transaction('documents', 'readonly');
    const store = tx.objectStore('documents');
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(0);
  });

  if (count === 0) {
    const tx = db.transaction(['folders', 'documents'], 'readwrite');
    const folderStore = tx.objectStore('folders');
    const docStore = tx.objectStore('documents');

    for (const folder of INITIAL_FOLDERS) {
      folderStore.put(folder);
    }
    for (const doc of INITIAL_DOCUMENTS) {
      docStore.put(doc);
    }

    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

// ---------------- Document Operations ----------------

export async function getAllDocuments() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('documents', 'readonly');
    const store = tx.objectStore('documents');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function getDocumentById(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('documents', 'readonly');
    const store = tx.objectStore('documents');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveDocument(doc) {
  const db = await openDB();
  const documentToSave = {
    ...doc,
    updatedAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('documents', 'readwrite');
    const store = tx.objectStore('documents');
    const req = store.put(documentToSave);
    req.onsuccess = () => resolve(documentToSave);
    req.onerror = () => reject(req.error);
  });
}

export async function createDocument({ title = 'untitled.md', folderId = null, content = '' }) {
  const db = await openDB();
  const id = 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const newDoc = {
    id,
    title: title.trim().endsWith('.md') ? title.trim() : `${title.trim()}.md`,
    folderId: folderId || null,
    content,
    createdAt: now,
    updatedAt: now
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('documents', 'readwrite');
    const store = tx.objectStore('documents');
    const req = store.add(newDoc);
    req.onsuccess = () => resolve(newDoc);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteDocument(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('documents', 'readwrite');
    const store = tx.objectStore('documents');
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

// ---------------- Folder Operations ----------------

export async function getAllFolders() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('folders', 'readonly');
    const store = tx.objectStore('folders');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function createFolder({ name = 'New Folder', parentId = null }) {
  const db = await openDB();
  const id = 'folder-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const newFolder = {
    id,
    name: name.trim(),
    parentId: parentId || null,
    createdAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('folders', 'readwrite');
    const store = tx.objectStore('folders');
    const req = store.add(newFolder);
    req.onsuccess = () => resolve(newFolder);
    req.onerror = () => reject(req.error);
  });
}

export async function updateFolder(id, updates) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('folders', 'readwrite');
    const store = tx.objectStore('folders');
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const folder = getReq.result;
      if (!folder) {
        reject(new Error('Folder not found'));
        return;
      }
      const updated = { ...folder, ...updates };
      const putReq = store.put(updated);
      putReq.onsuccess = () => resolve(updated);
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function deleteFolderAndContents(folderId) {
  const db = await openDB();
  // Find all child folders recursively
  const allFolders = await getAllFolders();
  const folderIdsToDelete = new Set([folderId]);

  function collectChildren(parent) {
    for (const f of allFolders) {
      if (f.parentId === parent && !folderIdsToDelete.has(f.id)) {
        folderIdsToDelete.add(f.id);
        collectChildren(f.id);
      }
    }
  }
  collectChildren(folderId);

  // Find all documents in these folders
  const allDocs = await getAllDocuments();
  const docsToDelete = allDocs.filter(d => folderIdsToDelete.has(d.folderId));

  // Perform transaction
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['folders', 'documents'], 'readwrite');
    const folderStore = tx.objectStore('folders');
    const docStore = tx.objectStore('documents');

    for (const fid of folderIdsToDelete) {
      folderStore.delete(fid);
    }
    for (const doc of docsToDelete) {
      docStore.delete(doc.id);
    }

    tx.oncomplete = () => resolve({ deletedFolders: Array.from(folderIdsToDelete), deletedDocs: docsToDelete.map(d => d.id) });
    tx.onerror = () => reject(tx.error);
  });
}

// ---------------- Settings Store ----------------

export async function getSetting(key, defaultValue = null) {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : defaultValue);
    req.onerror = () => resolve(defaultValue);
  });
}

export async function setSetting(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    const req = store.put({ key, value });
    req.onsuccess = () => resolve(value);
    req.onerror = () => reject(req.error);
  });
}
