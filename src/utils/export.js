/**
 * File export and download utilities
 */

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

export function exportWorkspaceArchive(documents = [], folders = []) {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    folders,
    documents
  };
  
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `devnote-workspace-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
