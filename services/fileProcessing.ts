import JSZip from 'jszip';
import { FileContent } from '../types';
import { IGNORED_PATHS, ALLOWED_EXTENSIONS } from '../constants';

export const extractZipContents = async (file: File): Promise<FileContent[]> => {
  // Defensive instantiation for JSZip in case of different ESM/UMD builds
  const ZipClass = (JSZip as any).default || JSZip;
  const zip = new ZipClass();
  
  const extractedFiles: FileContent[] = [];

  try {
    const loadedZip = await zip.loadAsync(file);

    // Get all file paths
    const filePaths = Object.keys(loadedZip.files);

    for (const path of filePaths) {
      const zipObject = loadedZip.files[path];

      // Skip directories (we infer them from paths if needed, but we mostly care about content)
      if (zipObject.dir) continue;

      // Filter ignored paths (e.g., node_modules)
      if (IGNORED_PATHS.some(ignored => path.includes(ignored))) continue;

      // Filter extensions
      const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext));
      if (!hasValidExtension) continue;

      // Read content
      const content = await zipObject.async('string');

      extractedFiles.push({
        path,
        content,
        type: 'file',
      });
    }

    return extractedFiles;

  } catch (error) {
    console.error("Error extracting ZIP:", error);
    throw new Error("Failed to extract ZIP file. Ensure it is a valid .zip archive and not corrupted.");
  }
};

export const formatFilesForPrompt = (files: FileContent[]): string => {
  // Limit the number of files or size if necessary to prevent context overflow, 
  // though Gemini Pro has a large window.
  // We explicitly filter for code files to keep the prompt clean.
  
  return JSON.stringify(
    files.map(f => ({ path: f.path, content: f.content })),
    null,
    2
  );
};