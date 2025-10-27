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
