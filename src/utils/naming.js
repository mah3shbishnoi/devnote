export function getUniqueDocTitle(requestedTitle = 'untitled.md', folderId = null, existingDocs = []) {
  let trimmed = (requestedTitle || 'untitled').trim();
  if (trimmed.endsWith('.md')) {
    trimmed = trimmed.slice(0, -3).trim();
  }
  if (!trimmed) trimmed = 'untitled';

  const siblingTitles = new Set(
    existingDocs
      .filter(d => (d.folderId || null) === (folderId || null))
      .map(d => d.title.toLowerCase())
  );

  const initialCandidate = `${trimmed}.md`;
  if (!siblingTitles.has(initialCandidate.toLowerCase())) {
    return initialCandidate;
  }

  const match = trimmed.match(/^(.*?)-(\d+)$/);
  const baseRoot = match ? match[1] : trimmed;

  let counter = 1;
  while (siblingTitles.has(`${baseRoot}-${counter}.md`.toLowerCase())) {
    counter++;
  }

  return `${baseRoot}-${counter}.md`;
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
      const base = doc.title.replace(/\.md$/, '');
      let count = nameMap.get(lowerTitle) + 1;
      nameMap.set(lowerTitle, count);

      const newTitle = `${base}-${count}.md`;
      doc.title = newTitle;
      hasModified = true;
    } else {
      nameMap.set(lowerTitle, 0);
    }
  }

  return hasModified;
}
