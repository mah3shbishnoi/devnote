/**
 * Document statistics calculation (word count, characters, reading time)
 */

export function calculateDocumentStats(content = '') {
  const characters = content.length;
  const trimmed = content.trim();
  
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).filter(Boolean).length;
  const lines = content.length === 0 ? 1 : content.split('\n').length;

  // Reading time (average 200 words per minute)
  const minutes = Math.ceil(words / 200);
  const readingTime = words === 0 ? '0 min read' : `${minutes} min read`;

  return {
    characters,
    words,
    lines,
    readingTime
  };
}
