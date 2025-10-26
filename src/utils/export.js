import JSZip from 'jszip';

export function exportDocument(doc) {
  if (!doc) return;
  const fileName = doc.title.endsWith('.md') ? doc.title : `${doc.title}.md`;
  const blob = new Blob([doc.content || ''], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildFolderPathMap(folders = []) {
  const folderById = new Map(folders.map(f => [f.id, f]));
  const pathMap = new Map();

  function resolvePath(folderId) {
    if (!folderId || !folderById.has(folderId)) return '';
    if (pathMap.has(folderId)) return pathMap.get(folderId);

    const folder = folderById.get(folderId);
    const parentPath = resolvePath(folder.parentId);
    const safeName = (folder.name || 'Untitled').replace(/[\\/:*?"<>|]/g, '_').trim();
    const fullPath = parentPath ? `${parentPath}/${safeName}` : safeName;

    pathMap.set(folderId, fullPath);
    return fullPath;
  }

  for (const f of folders) {
    resolvePath(f.id);
  }

  return pathMap;
}

export async function exportDocumentsAsZip(documents = [], folders = [], zipName = 'devnote-notes.zip') {
  if (!documents.length) return;

  const zip = new JSZip();
  const folderPathMap = buildFolderPathMap(folders);
  const seenPaths = new Set();

  for (const doc of documents) {
    const folderPath = doc.folderId ? (folderPathMap.get(doc.folderId) || '') : '';
    let fileName = doc.title.endsWith('.md') ? doc.title : `${doc.title}.md`;
    fileName = fileName.replace(/[\\/:*?"<>|]/g, '_').trim();

    let fullPath = folderPath ? `${folderPath}/${fileName}` : fileName;
    let counter = 1;
    const baseName = fileName.replace(/\.md$/, '');

    while (seenPaths.has(fullPath)) {
      const candidateName = `${baseName}-${counter}.md`;
      fullPath = folderPath ? `${folderPath}/${candidateName}` : candidateName;
      counter++;
    }

    seenPaths.add(fullPath);
    zip.file(fullPath, doc.content || '');
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function smartExport(state) {
  const editedDocs = state.getEditedDocuments();

  if (editedDocs.length === 1) {
    const singleDoc = editedDocs[0];
    exportDocument(singleDoc);
    return { type: 'single', name: singleDoc.title };
  }

  if (editedDocs.length > 1) {
    const timestamp = new Date().toISOString().slice(0, 10);
    const zipName = `devnote-notes-${timestamp}.zip`;
    await exportDocumentsAsZip(editedDocs, state.folders, zipName);
    return { type: 'zip', count: editedDocs.length };
  }

  const activeDoc = state.getActiveDoc();
  if (activeDoc) {
    exportDocument(activeDoc);
    return { type: 'single', name: activeDoc.title };
  }

  if (state.documents.length === 1) {
    exportDocument(state.documents[0]);
    return { type: 'single', name: state.documents[0].title };
  }

  if (state.documents.length > 1) {
    const timestamp = new Date().toISOString().slice(0, 10);
    await exportDocumentsAsZip(state.documents, state.folders, `devnote-workspace-${timestamp}.zip`);
    return { type: 'zip', count: state.documents.length };
  }

  return null;
}
