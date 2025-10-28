export function parseFileName(name = 'untitled.md') {
  let trimmed = (name || 'untitled.md').trim();
  if (!trimmed) trimmed = 'untitled.md';

  if (trimmed.startsWith('.') && !trimmed.slice(1).includes('.')) {
    return { base: trimmed, ext: '', originalExt: '' };
  }

  const lastDot = trimmed.lastIndexOf('.');
  if (lastDot > 0 && lastDot < trimmed.length - 1) {
    const ext = trimmed.slice(lastDot);
    const base = trimmed.slice(0, lastDot);
    return {
      base,
      ext: ext.toLowerCase(),
      originalExt: ext
    };
  }

  return {
    base: trimmed,
    ext: '.md',
    originalExt: '.md'
  };
}

export function getUniqueDocTitle(requestedTitle = 'untitled.md', folderId = null, existingDocs = []) {
  let trimmed = (requestedTitle || 'untitled.md').trim();
  if (!trimmed) trimmed = 'untitled.md';

  const { base, originalExt } = parseFileName(trimmed);

  const siblingTitles = new Set(
    existingDocs
      .filter(d => (d.folderId || null) === (folderId || null))
      .map(d => d.title.toLowerCase())
  );

  const initialCandidate = `${base}${originalExt}`;
  if (!siblingTitles.has(initialCandidate.toLowerCase())) {
    return initialCandidate;
  }

  const match = base.match(/^(.*?)-(\d+)$/);
  const baseRoot = match ? match[1] : base;
  let counter = match ? parseInt(match[2], 10) + 1 : 1;

  while (siblingTitles.has(`${baseRoot}-${counter}${originalExt}`.toLowerCase())) {
    counter++;
  }

  return `${baseRoot}-${counter}${originalExt}`;
}

export function getUniqueFolderName(requestedName = 'New Folder', parentId = null, existingFolders = []) {
  let trimmed = (requestedName || 'New Folder').trim();
  if (!trimmed) trimmed = 'New Folder';

  const siblingNames = new Set(
    existingFolders
      .filter(f => (f.parentId || null) === (parentId || null))
      .map(f => f.name.toLowerCase())
  );

  if (!siblingNames.has(trimmed.toLowerCase())) {
    return trimmed;
  }

  const match = trimmed.match(/^(.*?)\s*\((\d+)\)$/);
  const baseRoot = match ? match[1].trim() : trimmed;

  let counter = 1;
  while (siblingNames.has(`${baseRoot} (${counter})`.toLowerCase())) {
    counter++;
  }

  return `${baseRoot} (${counter})`;
}

export function deduplicateExistingDocs(docs = []) {
  const seenByFolder = new Map();
  let hasModified = false;

  for (const doc of docs) {
    const folderKey = doc.folderId || 'root';
    if (!seenByFolder.has(folderKey)) {
      seenByFolder.set(folderKey, new Map());
    }
    const nameMap = seenByFolder.get(folderKey);
    const lowerTitle = doc.title.toLowerCase();

    if (nameMap.has(lowerTitle)) {
      const { base, originalExt } = parseFileName(doc.title);
      let count = nameMap.get(lowerTitle) + 1;
      nameMap.set(lowerTitle, count);

      const newTitle = `${base}-${count}${originalExt}`;
      doc.title = newTitle;
      hasModified = true;
    } else {
      nameMap.set(lowerTitle, 0);
    }
  }

  return hasModified;
}

export function validateDocTitle(requestedTitle, folderId = null, existingDocs = [], excludeDocId = null) {
  const trimmed = (requestedTitle || '').trim();
  if (!trimmed) return 'Document title cannot be empty.';
  const { base, originalExt } = parseFileName(trimmed);
  const candidate = `${base}${originalExt}`.toLowerCase();
  const exists = existingDocs.some(
    d => d.id !== excludeDocId && (d.folderId || null) === (folderId || null) && d.title.toLowerCase() === candidate
  );
  if (exists) {
    return `"${base}${originalExt}" already exists in this location.`;
  }
  return null;
}

export function validateFolderName(requestedName, parentId = null, existingFolders = [], excludeFolderId = null) {
  const trimmed = (requestedName || '').trim();
  if (!trimmed) return 'Folder name cannot be empty.';
  const exists = existingFolders.some(
    f => f.id !== excludeFolderId && (f.parentId || null) === (parentId || null) && f.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) {
    return `Folder "${trimmed}" already exists.`;
  }
  return null;
}

