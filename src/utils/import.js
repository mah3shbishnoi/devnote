const BLOCKED_BINARY_EXTENSIONS = new Set([
  '.exe', '.bin', '.dll', '.so', '.dylib', '.dmg', '.iso', '.zip', '.tar', '.gz',
  '.7z', '.rar', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.bmp', '.pdf',
  '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.mp3', '.mp4', '.wav', '.mov',
  '.avi', '.mkv', '.class', '.jar', '.wasm', '.o', '.a', '.pyc', '.node'
]);

export function isBinaryFile(fileName, sampleText = '') {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot !== -1) {
    const ext = fileName.slice(lastDot).toLowerCase();
    if (BLOCKED_BINARY_EXTENSIONS.has(ext)) {
      return true;
    }
  }

  // Null-byte check in text sample
  if (sampleText && sampleText.slice(0, 1000).includes('\0')) {
    return true;
  }

  return false;
}

export function selectAndReadTextFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,.txt,.json,.js,.ts,.jsx,.tsx,.css,.html,.xml,.yaml,.yml,.py,.sh,.bash,.sql,.csv,.log,.env,.toml,.ini,.conf,text/*';
    input.style.display = 'none';

    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      if (isBinaryFile(file.name)) {
        reject(new Error(`"${file.name}" is a binary file. DevNote only supports text and code files.`));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result || '';
        if (typeof content === 'string' && isBinaryFile(file.name, content)) {
          reject(new Error(`"${file.name}" contains binary data. DevNote only supports text files.`));
          return;
        }

        resolve({
          name: file.name,
          content,
          size: file.size
        });
      };

      reader.onerror = () => {
        reject(new Error('Failed to read the selected file.'));
      };

      reader.readAsText(file);
    };

    input.oncancel = () => {
      resolve(null);
    };

    document.body.appendChild(input);
    input.click();
    setTimeout(() => {
      document.body.removeChild(input);
    }, 1000);
  });
}

// Backward-compatible alias
export const selectAndReadMarkdownFile = selectAndReadTextFile;
