import JSZip from 'jszip';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import { FBXLoader } from 'three-stdlib';
import { STLLoader } from 'three-stdlib';
import { TGALoader } from 'three-stdlib';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { createExtractorFromData } from 'node-unrar-js/esm';

export const SUPPORTED_3D_EXTENSIONS = [
  'glb',
  'gltf',
  'obj',
  'fbx',
  'usdz',
  'stl'
];

export const SUPPORTED_ARCHIVE_EXTENSIONS = [
  'zip',
  'rar',
  '7z',
  'tar',
  'gz'
];

/**
 * Traverses an HTML5 DataTransfer object recursively to support folder drag & drop
 * @param {DataTransfer} dataTransfer
 * @returns {Promise<Array<{ file: File, path: string }>>}
 */
export async function extractFilesFromDataTransfer(dataTransfer) {
  const fileEntries = [];
  const items = dataTransfer?.items;

  if (items && items.length > 0 && typeof items[0].webkitGetAsEntry === 'function') {
    const traverseEntry = async (entry, currentPath = '') => {
      if (!entry) return;
      if (entry.isFile) {
        const file = await new Promise((resolve, reject) => {
          entry.file(resolve, reject);
        });
        const relativePath = currentPath ? `${currentPath}/${file.name}` : file.name;
        fileEntries.push({ file, path: relativePath });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const nextPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;

        const readAllEntries = async () => {
          let batch = [];
          let currentBatch = await new Promise((resolve, reject) => {
            dirReader.readEntries(resolve, reject);
          });
          while (currentBatch && currentBatch.length > 0) {
            batch = batch.concat(currentBatch);
            currentBatch = await new Promise((resolve, reject) => {
              dirReader.readEntries(resolve, reject);
            });
          }
          return batch;
        };

        const children = await readAllEntries();
        for (const child of children) {
          await traverseEntry(child, nextPath);
        }
      }
    };

    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry();
      if (entry) {
        await traverseEntry(entry);
      }
    }
  } else if (dataTransfer?.files && dataTransfer.files.length > 0) {
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const file = dataTransfer.files[i];
      fileEntries.push({ file, path: file.webkitRelativePath || file.name });
    }
  }

  return fileEntries;
}

/**
 * Packages multiple files into a single ZIP archive file in memory
 * @param {Array<{ file: File, path: string }>} fileEntries
 * @param {string} zipName
 * @returns {Promise<File>}
 */
export async function packageFilesToZip(fileEntries, zipName = 'model_package.zip') {
  const zip = new JSZip();

  const sanitized = fileEntries.map(({ file, path }) => ({
    file,
    path: (path || file.name).replace(/\\/g, '/').replace(/^\/+/, '')
  }));

  // Strip common root directory if all files are inside one top folder
  let commonPrefix = '';
  const firstSlashIdxs = sanitized.map((e) => e.path.indexOf('/'));
  if (sanitized.length > 1 && firstSlashIdxs.every((idx) => idx > 0)) {
    const candidatePrefix = sanitized[0].path.substring(0, firstSlashIdxs[0] + 1);
    if (sanitized.every((e) => e.path.startsWith(candidatePrefix))) {
      commonPrefix = candidatePrefix;
    }
  }

  sanitized.forEach(({ file, path }) => {
    const cleanPath = commonPrefix ? path.substring(commonPrefix.length) : path;
    zip.file(cleanPath, file);
  });

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  return new File([zipBlob], zipName, { type: 'application/zip' });
}
function isIgnoredEntry(rawPath) {
  if (!rawPath) return true;
  const path = rawPath.replace(/\\/g, '/');
  // Ignore macOS metadata and typical OS junk
  if (path.startsWith('__MACOSX/') || path.includes('/__MACOSX/')) return true;
  
  const segments = path.split('/');
  const filename = segments[segments.length - 1];
  
  // Ignore system files
  if (filename === '.DS_Store' || filename === 'Thumbs.db' || filename === 'desktop.ini') return true;
  
  // Ignore hidden dot files/folders (e.g. .git, ._model.gltf, .svn), but don't ignore relative "./" or folders with dots like "v1.0"
  for (const seg of segments) {
    if (seg !== '.' && seg !== '..' && seg.startsWith('.')) {
      return true;
    }
  }
  return false;
}

/**
 * Identifies the primary 3D model file from a list of files or file paths
 */
export function findPrimary3DModel(files) {
  if (!files || files.length === 0) return null;

  const priorityOrder = ['gltf', 'glb', 'fbx', 'obj', 'usdz', 'stl'];

  for (const prioExt of priorityOrder) {
    const candidates = files.filter((item) => {
      const name = item.file ? item.file.name : (item.name || '');
      const path = (item.path || name).replace(/\\/g, '/');
      const ext = name.includes('.') ? name.split('.').pop()?.trim().toLowerCase() : '';
      return ext === prioExt && !isIgnoredEntry(path);
    });

    if (candidates.length > 0) {
      // If there are multiple candidates (e.g. static FBX vs animated FBX),
      // prioritize the one containing 'anim' in its name
      const animatedCandidate = candidates.find((item) => {
        const name = (item.file ? item.file.name : (item.name || '')).toLowerCase();
        return name.includes('anim');
      });
      return animatedCandidate || candidates[0];
    }
  }

  // Fallback: Check if any item has any supported extension anywhere in its name
  return files.find((item) => {
    const name = item.file ? item.file.name : (item.name || '');
    const path = (item.path || name).replace(/\\/g, '/');
    const ext = name.includes('.') ? name.split('.').pop()?.trim().toLowerCase() : '';
    return priorityOrder.includes(ext) && !isIgnoredEntry(path);
  }) || null;
}

/**
 * Helper to extract a RAR file into in-memory file objects
 */
async function extractRarArchive(archiveBufferOrBlob) {
  const data = archiveBufferOrBlob instanceof ArrayBuffer
    ? archiveBufferOrBlob
    : await archiveBufferOrBlob.arrayBuffer();

  let wasmBinary;
  try {
    const wasmRes = await fetch('/unrar.wasm');
    if (wasmRes.ok) {
      wasmBinary = await wasmRes.arrayBuffer();
    }
  } catch (e) {
    console.warn('Could not pre-fetch /unrar.wasm, falling back to default:', e);
  }

  const extractor = await createExtractorFromData({
    data,
    ...(wasmBinary ? { wasmBinary } : {})
  });

  const extracted = extractor.extract();
  const files = [];

  for (const item of extracted.files) {
    if (!item.fileHeader.flags.directory && item.extraction) {
      const path = item.fileHeader.name.replace(/\\/g, '/');
      const blob = new Blob([item.extraction]);
      files.push({ path, blob });
    }
  }

  return files;
}

/**
 * Checks if a buffer is a RAR archive
 */
function isRarBuffer(buffer) {
  if (!buffer || buffer.byteLength < 7) return false;
  const bytes = new Uint8Array(buffer.slice(0, 7));
  // RAR 1.5 - 4.x: 52 61 72 21 1A 07 00
  // RAR 5.0+:     52 61 72 21 1A 07 01 00
  return bytes[0] === 0x52 && bytes[1] === 0x61 && bytes[2] === 0x72 && bytes[3] === 0x21 && bytes[4] === 0x1a && bytes[5] === 0x07;
}

/**
 * Unpacks a ZIP / RAR / Archive and creates an in-memory virtual file map.
 * Also recursively extracts any nested ZIP or RAR archives (e.g. source/model.rar or source/model.zip).
 * Returns blob URLs keyed by lowercase filename and normalized relative path
 * @param {Blob|File} archiveFile
 * @returns {Promise<{ primaryEntry: { name: string, ext: string, blob: Blob }, urlMap: Map<string, string>, fileCount: number, revokeAll: () => void }>}
 */
export async function unpackZipArchive(archiveFile) {
  const urlMap = new Map();
  const createdUrls = [];
  const entries = [];

  const rawBuffer = await archiveFile.arrayBuffer();
  const isTopRar = isRarBuffer(rawBuffer) || (archiveFile.name && archiveFile.name.toLowerCase().endsWith('.rar'));

  // Collect all raw { path, blob } entries (flattening nested archives if present)
  let rawFiles = [];

  if (isTopRar) {
    try {
      rawFiles = await extractRarArchive(rawBuffer);
    } catch (err) {
      console.warn('Failed top-level RAR extraction:', err);
    }
  } else {
    try {
      const zip = await JSZip.loadAsync(rawBuffer);
      for (const [rawRelativePath, zipEntry] of Object.entries(zip.files)) {
        if (!zipEntry.dir) {
          const blob = await zipEntry.async('blob');
          rawFiles.push({ path: rawRelativePath, blob });
        }
      }
    } catch (err) {
      // If JSZip fails, test if it might be a RAR file renamed or disguised
      if (isRarBuffer(rawBuffer)) {
        rawFiles = await extractRarArchive(rawBuffer);
      } else {
        throw err;
      }
    }
  }

  // Second pass: recursively expand any nested .rar or .zip files (e.g. source/*.rar or *.zip)
  const expandedFiles = [];
  for (const item of rawFiles) {
    const cleanPath = item.path.replace(/\\/g, '/').replace(/^\.?\/+/, '');
    const lowerPath = cleanPath.toLowerCase();

    if (lowerPath.endsWith('.rar')) {
      try {
        const nestedBuf = await item.blob.arrayBuffer();
        if (isRarBuffer(nestedBuf)) {
          const nestedEntries = await extractRarArchive(nestedBuf);
          const parentDir = cleanPath.includes('/') ? cleanPath.substring(0, cleanPath.lastIndexOf('/') + 1) : '';
          for (const n of nestedEntries) {
            expandedFiles.push({ path: `${parentDir}${n.path}`, blob: n.blob });
          }
          continue;
        }
      } catch (err) {
        console.warn('Failed to expand nested RAR archive:', cleanPath, err);
      }
    } else if (lowerPath.endsWith('.zip')) {
      try {
        const nestedBuf = await item.blob.arrayBuffer();
        const nestedZip = await JSZip.loadAsync(nestedBuf);
        const parentDir = cleanPath.includes('/') ? cleanPath.substring(0, cleanPath.lastIndexOf('/') + 1) : '';
        for (const [subPath, subZipEntry] of Object.entries(nestedZip.files)) {
          if (!subZipEntry.dir) {
            const subBlob = await subZipEntry.async('blob');
            expandedFiles.push({ path: `${parentDir}${subPath}`, blob: subBlob });
          }
        }
        continue;
      } catch (err) {
        console.warn('Failed to expand nested ZIP archive:', cleanPath, err);
      }
    }

    expandedFiles.push(item);
  }

  // Populate virtual file map and entries
  for (const item of expandedFiles) {
    const cleanPath = item.path.replace(/\\/g, '/').replace(/^\.?\/+/, '');
    if (isIgnoredEntry(cleanPath)) {
      continue;
    }

    const fileName = cleanPath.split('/').pop();
    const ext = fileName.includes('.') ? fileName.split('.').pop().trim().toLowerCase() : '';
    const blob = item.blob;
    const objectUrl = URL.createObjectURL(blob);
    createdUrls.push(objectUrl);

    // Map exact relative path, lowercase relative path, plain filename, and stripped variants
    urlMap.set(cleanPath, objectUrl);
    urlMap.set(cleanPath.toLowerCase(), objectUrl);
    urlMap.set(fileName, objectUrl);
    urlMap.set(fileName.toLowerCase(), objectUrl);

    // If path is e.g. "source/model.gltf" or "textures/image.png", also index subpaths
    const parts = cleanPath.split('/');
    for (let i = 1; i < parts.length; i++) {
      const sub = parts.slice(i).join('/');
      if (!urlMap.has(sub)) urlMap.set(sub, objectUrl);
      if (!urlMap.has(sub.toLowerCase())) urlMap.set(sub.toLowerCase(), objectUrl);
    }

    entries.push({
      name: fileName,
      path: cleanPath,
      ext,
      blob,
      objectUrl
    });
  }

  const primary = findPrimary3DModel(entries);
  if (!primary) {
    console.warn('Archive entries found:', entries.map(e => e.path));
    throw new Error('No supported 3D model (.gltf, .glb, .fbx, .obj, .usdz, .stl) found inside the archive.');
  }

  return {
    primaryEntry: primary,
    urlMap,
    fileCount: entries.length,
    revokeAll: () => {
      createdUrls.forEach((u) => URL.revokeObjectURL(u));
    }
  };
}

/**
 * Safe TGALoader subclass that validates magic headers before parsing.
 * If a model references a ".tga" texture path that was actually saved as a PNG/JPEG/WEBP inside the archive,
 * this prevents three-stdlib's TGALoader from throwing `Invalid type "78"` or attempting to allocate giant corrupt textures.
 */
class SafeTGALoader extends TGALoader {
  parse(buffer) {
    if (buffer && buffer.byteLength >= 4) {
      const bytes = new Uint8Array(buffer.slice(0, 4));
      // Check for PNG magic: 0x89 'P' 'N' 'G' (where 'N' is 78 ASCII!)
      const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
      // Check for JPEG magic: 0xFF 0xD8 0xFF
      const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
      // Check for GIF magic: 'G' 'I' 'F'
      const isGif = bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46;
      // Check for WebP magic: 'R' 'I' 'F' 'F'
      const isWebp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;

      if (isPng || isJpg || isGif || isWebp) {
        // Return 1x1 neutral fallback DataTexture image to prevent corrupt TGA parsing and GPU memory out-of-range errors
        return {
          width: 1,
          height: 1,
          data: new Uint8Array([255, 255, 255, 255])
        };
      }
    }

    try {
      return super.parse(buffer);
    } catch (_e) {
      return {
        width: 1,
        height: 1,
        data: new Uint8Array([255, 255, 255, 255])
      };
    }
  }
}

/**
 * Builds a Three.js LoadingManager from a virtual URL map
 * Accurately maps relative paths from glTF / obj / fbx referencing subfolders (e.g., textures/..., scene.bin)
 */
export function createVirtualLoadingManager(urlMap, basePath = '') {
  const manager = new THREE.LoadingManager();

  // Register SafeTGALoader so FBXLoader parses valid TGAs and safely ignores non-TGA files
  try {
    manager.addHandler(/\.tga$/i, new SafeTGALoader(manager));
  } catch (_e) {}

  manager.setURLModifier((rawUrl) => {
    // Decode URI components
    let decoded = decodeURIComponent(rawUrl);

    // If it's a blob:http://... or blob:https://... URL created by Three.js resolving relative paths against blob:
    // e.g. blob:http://localhost:5173/scene.bin or blob:http://localhost:5173/textures/...
    // or plain relative/absolute url
    let cleanUrl = decoded
      .replace(/^blob:https?:\/\/[^/]+\//i, '')
      .replace(/^https?:\/\/[^/]+\//i, '')
      .replace(/^\/+/, '')
      .replace(/^(\.\/|\/)+/, '');

    // If it's still a valid registered blob URL that's already in our map or createdUrls, return it
    if (rawUrl.startsWith('blob:') && !rawUrl.includes('/scene.bin') && !rawUrl.includes('/textures/') && Array.from(urlMap.values()).includes(rawUrl)) {
      return rawUrl;
    }

    const fileName = cleanUrl.split('/').pop();

    // Candidates to match against in order of specificity:
    const candidates = [
      cleanUrl,
      cleanUrl.toLowerCase(),
      basePath ? `${basePath}/${cleanUrl}`.replace(/\/+/g, '/') : null,
      basePath ? `${basePath}/${cleanUrl}`.replace(/\/+/g, '/').toLowerCase() : null,
      fileName,
      fileName.toLowerCase(),
      // Handle cases where FBX requests .tga but file is saved as .tga.png or .png / .jpg
      fileName ? `${fileName}.png` : null,
      fileName ? `${fileName.toLowerCase()}.png` : null,
      fileName ? fileName.replace(/\.tga$/i, '.png') : null,
      fileName ? fileName.toLowerCase().replace(/\.tga$/i, '.png') : null,
      fileName ? fileName.replace(/\.tga$/i, '.jpg') : null,
      fileName ? fileName.toLowerCase().replace(/\.tga$/i, '.jpg') : null,
      fileName ? fileName.replace(/\.tga$/i, '.jpeg') : null,
      fileName ? fileName.toLowerCase().replace(/\.tga$/i, '.jpeg') : null
    ].filter(Boolean);

    for (const c of candidates) {
      if (urlMap.has(c)) {
        return urlMap.get(c);
      }
    }

    return rawUrl;
  });

  return manager;
}
