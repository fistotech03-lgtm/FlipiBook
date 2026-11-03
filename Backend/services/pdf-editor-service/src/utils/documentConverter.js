const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile, exec } = require('child_process');
const { promisify } = require('util');
const { nanoid } = require('nanoid');

const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);

let cachedLibreOfficePath = null;

const CANDIDATE_SOFFICE_PATHS = [
  process.env.LIBREOFFICE_PATH,
  '/Applications/LibreOffice.app/Contents/MacOS/soffice',
  '/Applications/LibreOffice.app/Contents/MacOS/libreoffice',
  '/opt/homebrew/bin/soffice',
  '/opt/homebrew/bin/libreoffice',
  '/usr/local/bin/soffice',
  '/usr/local/bin/libreoffice',
  'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
  'C:\\Program Files\\LibreOffice\\program\\soffice.com',
  'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
  '/usr/bin/soffice',
  '/usr/bin/libreoffice',
  'soffice.exe',
  'soffice.com',
  'soffice',
  'libreoffice'
].filter(Boolean);

/**
 * Returns a clean Windows temp directory path without 8.3 short names.
 */
const getRealTempDir = () => {
  if (process.platform !== 'win32') return os.tmpdir();

  const candidates = [
    process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Temp') : null,
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Temp') : null,
    process.env.SystemDrive ? path.join(process.env.SystemDrive + '\\', 'lo_temp') : null,
    'C:\\lo_temp'
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate.includes('~')) continue;
    try {
      fs.mkdirSync(candidate, { recursive: true });
      return candidate;
    } catch (e) {}
  }

  return os.tmpdir();
};

/**
 * Resolves the path to the LibreOffice / soffice binary using LIBREOFFICE_PATH
 * configured in .env, and ensures its directory is added to process.env.PATH.
 */
const getLibreOfficePath = () => {
  if (cachedLibreOfficePath && fs.existsSync(cachedLibreOfficePath)) {
    return cachedLibreOfficePath;
  }

  const envPath = process.env.LIBREOFFICE_PATH;
  if (envPath && fs.existsSync(envPath)) {
    cachedLibreOfficePath = envPath;
    const binDir = path.dirname(envPath);
    if (process.env.PATH && !process.env.PATH.includes(binDir)) {
      process.env.PATH = `${binDir}${path.delimiter}${process.env.PATH}`;
    }
    return envPath;
  }

  for (const candidate of CANDIDATE_SOFFICE_PATHS) {
    try {
      if (fs.existsSync(candidate)) {
        cachedLibreOfficePath = candidate;
        const binDir = path.dirname(candidate);
        if (process.env.PATH && !process.env.PATH.includes(binDir)) {
          process.env.PATH = `${binDir}${path.delimiter}${process.env.PATH}`;
        }
        return candidate;
      }
    } catch (e) {}
  }

  const fallback = process.platform === 'win32'
    ? 'C:\\Program Files\\LibreOffice\\program\\soffice.exe'
    : 'soffice';
  cachedLibreOfficePath = fallback;
  return fallback;
};

// Initialize PATH early
getLibreOfficePath();

/**
 * Returns a sanitized environment for running LibreOffice headlessly.
 * Strips conflicting Python environment variables.
 */
const getCleanLibreOfficeEnv = (binaryPath) => {
  const cleanEnv = { ...process.env };
  delete cleanEnv.PYTHONHOME;
  delete cleanEnv.PYTHONPATH;
  delete cleanEnv.PYTHONSTARTUP;
  delete cleanEnv.PYTHONEXECUTABLE;
  delete cleanEnv.PYTHONIOENCODING;
  delete cleanEnv.PYTHONUTF8;

  const binDir = path.dirname(binaryPath);
  cleanEnv.PATH = `${binDir}${path.delimiter}${cleanEnv.PATH || ''}`;
  return cleanEnv;
};

/**
 * Standard execution options for LibreOffice child processes.
 */
const getExecOptions = (binaryPath, timeout = 60000) => ({
  cwd: path.dirname(binaryPath),
  env: getCleanLibreOfficeEnv(binaryPath),
  windowsHide: true,
  timeout,
  maxBuffer: 50 * 1024 * 1024
});

/**
 * Find the most-recently-modified PDF file in a directory.
 */
const findNewestPdf = (dir) => {
  try {
    const pdfs = fs.readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith('.pdf'))
      .map((f) => ({ name: f, mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
    return pdfs.length > 0 ? path.join(dir, pdfs[0].name) : null;
  } catch (e) {
    return null;
  }
};

/**
 * Checks if LibreOffice is available and returns version info.
 */
const checkLibreOfficeStatus = async () => {
  const binaryPath = getLibreOfficePath();

  try {
    const { stdout } = await execFileAsync(
      binaryPath,
      ['--headless', '--invisible', '--nologo', '--version'],
      getExecOptions(binaryPath, 10000)
    );
    return {
      available: true,
      version: stdout.trim().split('\n')[0],
      path: binaryPath
    };
  } catch (err) {
    try {
      const fallbackCmd = process.platform === 'win32'
        ? 'soffice.com --headless --invisible --nologo --version'
        : 'soffice --headless --invisible --nologo --version';
      const { stdout } = await execAsync(fallbackCmd, {
        cwd: path.dirname(binaryPath),
        env: getCleanLibreOfficeEnv(binaryPath),
        windowsHide: true,
        timeout: 8000
      });
      return {
        available: true,
        version: stdout.trim().split('\n')[0],
        path: process.platform === 'win32' ? 'soffice.com' : 'soffice'
      };
    } catch (e) {
      return {
        available: false,
        path: binaryPath,
        error: 'LibreOffice executable (soffice) not found on system.'
      };
    }
  }
};

/**
 * Supported office document extensions
 */
const SUPPORTED_OFFICE_EXTENSIONS = [
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.odt',
  '.odp',
  '.rtf',
  '.txt'
];

const isOfficeDocument = (filename) => {
  if (!filename) return false;
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_OFFICE_EXTENSIONS.includes(ext);
};

/**
 * Sequential FIFO Queue for LibreOffice conversions.
 * Ensures only 1 LibreOffice process runs at a time to prevent lock conflicts.
 */
class OfficeConversionQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  enqueue(task, label = 'Document') {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject, label, enqueuedAt: Date.now() });
      console.log(`[Document Queue] Enqueued "${label}". Pending tasks in queue: ${this.queue.length}`);
      this.processNext();
    });
  }

  async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const { task, resolve, reject, label, enqueuedAt } = this.queue.shift();
    const waitTime = Date.now() - enqueuedAt;
    console.log(`[Document Queue] Starting "${label}" (waited ${waitTime}ms in queue, ${this.queue.length} remaining)...`);

    try {
      const result = await task();
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      this.isProcessing = false;
      setTimeout(() => this.processNext(), 100);
    }
  }

  get length() {
    return this.queue.length;
  }
}

const officeQueue = new OfficeConversionQueue();

/**
 * Convert PowerPoint or Word document to PDF using LibreOffice with isolated profile.
 */
async function convertPptxToPdf(inputFile, outputDir, filter = null) {
  const profileDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'lo-profile-')
  );

  const ext = path.extname(inputFile).toLowerCase();
  const isPresentation = ['.ppt', '.pptx', '.odp'].includes(ext);
  const isWordDoc = ['.doc', '.docx', '.odt', '.rtf', '.txt'].includes(ext);
  const targetFilter = filter || (isPresentation ? 'pdf:impress_pdf_Export' : (isWordDoc ? 'pdf:writer_pdf_Export' : 'pdf'));

  const args = [
    `-env:UserInstallation=file:///${profileDir.replace(/\\/g, '/')}`,
    '--headless',
    '--nologo',
    '--nodefault',
    '--nofirststartwizard',
    '--norestore',
    '--convert-to',
    targetFilter,
    '--outdir',
    outputDir,
    inputFile
  ];

  const binaryPath = getLibreOfficePath();

  try {
    console.log(`[Document Converter] Running convertPptxToPdf on ${path.basename(inputFile)} with filter ${targetFilter}`);
    await execFileAsync(binaryPath, args, {
      cwd: path.dirname(binaryPath),
      env: getCleanLibreOfficeEnv(binaryPath),
      windowsHide: true,
      timeout: 120000,
      maxBuffer: 20 * 1024 * 1024
    });
  } catch (err) {
    const errText = `${err.stderr || ''} ${err.stdout || ''} ${err.message || ''}`.toLowerCase();
    const displayFileName = path.basename(inputFile);

    if (
      errText.includes('source file could not be loaded') ||
      errText.includes('cannot be read') ||
      errText.includes('corrupt') ||
      errText.includes('damaged') ||
      errText.includes('password') ||
      errText.includes('format error') ||
      errText.includes('general error') ||
      errText.includes('input/output error') ||
      errText.includes('read error') ||
      errText.includes('could not be opened')
    ) {
      throw new Error(`Your file "${displayFileName}" is corrupted, unreadable, or password-protected. Please check the file in PowerPoint/Word and try again.`);
    }

    if (targetFilter !== 'pdf') {
      console.warn(`[Document Converter] Filter ${targetFilter} failed, retrying with generic 'pdf': ${err.message.split('\n')[0]}`);
      const fallbackArgs = [
        `-env:UserInstallation=file:///${profileDir.replace(/\\/g, '/')}`,
        '--headless',
        '--nologo',
        '--nodefault',
        '--nofirststartwizard',
        '--norestore',
        '--convert-to',
        'pdf',
        '--outdir',
        outputDir,
        inputFile
      ];

      await execFileAsync(binaryPath, fallbackArgs, {
        cwd: path.dirname(binaryPath),
        env: getCleanLibreOfficeEnv(binaryPath),
        windowsHide: true,
        timeout: 120000,
        maxBuffer: 20 * 1024 * 1024
      });
    } else {
      throw err;
    }
  } finally {
    try {
      await fs.promises.rm(profileDir, { recursive: true, force: true });
    } catch (e) {}
  }

  const pdfName = path.basename(inputFile, path.extname(inputFile)) + '.pdf';
  let pdfPath = path.join(outputDir, pdfName);

  if (!fs.existsSync(pdfPath)) {
    const fallbackPdf = findNewestPdf(outputDir);
    if (fallbackPdf && fs.existsSync(fallbackPdf) && fs.statSync(fallbackPdf).size > 0) {
      pdfPath = fallbackPdf;
    } else {
      throw new Error(`LibreOffice completed but PDF was not created: ${pdfPath}`);
    }
  }

  return pdfPath;
}

/**
 * Converts a Word or PowerPoint file into a PDF locally without Supabase.
 */
const executeOfficeConversion = async (inputDocPath, outputPdfPath) => {
  if (!fs.existsSync(inputDocPath)) {
    throw new Error(`Input document not found: ${inputDocPath}`);
  }

  const inputFileName = path.basename(inputDocPath);
  const jobId = nanoid(10);
  console.log(`[Document Converter] [${jobId}] Converting ${inputFileName} -> PDF`);

  const realTempDir = getRealTempDir();
  const localWorkDir = path.join(realTempDir, 'lo_work', jobId);
  fs.mkdirSync(localWorkDir, { recursive: true });

  const ext = path.extname(inputFileName).toLowerCase();
  const safeInputFileName = `doc_${jobId}${ext}`;
  const localInputPath = path.join(localWorkDir, safeInputFileName);
  fs.copyFileSync(inputDocPath, localInputPath);

  try {
    const generatedPdfPath = await convertPptxToPdf(localInputPath, localWorkDir);

    const finalOutputDir = path.dirname(outputPdfPath);
    if (!fs.existsSync(finalOutputDir)) {
      fs.mkdirSync(finalOutputDir, { recursive: true });
    }

    fs.copyFileSync(generatedPdfPath, outputPdfPath);

    if (!fs.existsSync(outputPdfPath) || fs.statSync(outputPdfPath).size === 0) {
      throw new Error(`LibreOffice conversion failed: generated PDF at ${outputPdfPath} is missing or empty`);
    }

    console.log(`[Document Converter] [${jobId}] Conversion successful: ${outputPdfPath}`);
    return outputPdfPath;
  } catch (convErr) {
    console.error(`[Document Converter] [${jobId}] Conversion error:`, convErr.message);

    const fullErrStr = `${convErr.message || ''} ${convErr.stderr || ''} ${convErr.stdout || ''}`.toLowerCase();
    if (
      fullErrStr.includes('corrupt') ||
      fullErrStr.includes('cannot be read') ||
      fullErrStr.includes('source file could not be loaded') ||
      fullErrStr.includes('damaged') ||
      fullErrStr.includes('password') ||
      fullErrStr.includes('format error') ||
      fullErrStr.includes('could not be opened') ||
      fullErrStr.includes('input/output error') ||
      fullErrStr.includes('read error') ||
      fullErrStr.includes('command failed')
    ) {
      throw new Error(`Your file "${inputFileName}" is corrupted, unreadable, or password-protected. Please check the file in PowerPoint/Word and try again.`);
    }

    throw convErr;
  } finally {
    try {
      fs.rmSync(localWorkDir, { recursive: true, force: true });
    } catch (e) {}
  }
};

/**
 * Converts a Word or PowerPoint file into a PDF queued sequentially.
 */
const convertOfficeToPdf = (inputDocPath, outputPdfPath) => {
  const label = path.basename(inputDocPath);
  return officeQueue.enqueue(() => executeOfficeConversion(inputDocPath, outputPdfPath), label);
};

module.exports = {
  getLibreOfficePath,
  checkLibreOfficeStatus,
  isOfficeDocument,
  convertOfficeToPdf,
  convertPptxToPdf,
  officeQueue,
  SUPPORTED_OFFICE_EXTENSIONS
};
